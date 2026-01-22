import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const part = hex.substr(i * 2, 2);
    bytes[i] = parseInt(part, 16);
  }
  return bytes;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // AbacatePay panels sometimes "test" the URL with GET/HEAD.
  if (req.method === "GET" || req.method === "HEAD") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Only accept POST requests for actual webhook delivery
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const webhookSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");

    // Get the signature from headers
    const signature = req.headers.get("x-webhook-signature");
    const signatureValid = !!signature; // Default to signature exists check for now, but will implement HMAC if secret is found

    // Get raw body for signature verification
    const rawBody = await req.text();
    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("Failed to parse webhook body");
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature if secret is provided
    if (webhookSecret && signature) {
      // HMAC SHA256 from AbacatePay
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      const verified = await crypto.subtle.verify(
        "HMAC",
        key,
        hexToBytes(signature),
        encoder.encode(rawBody)
      );

      if (!verified) {
        console.error("Invalid webhook signature attempt");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (webhookSecret && !signature) {
      console.error("Missing webhook signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook for debugging
    await supabase.from("webhook_logs").insert({
      provider: "abacatepay",
      event_type: body.event || body.type || "unknown",
      payload: body,
      signature_valid: signatureValid,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
    });

    // Handle different event types from AbacatePay
    const eventType = body.event || body.type;
    console.log("Event type:", eventType);

    // Handle PIX QR Code paid event
    if (eventType === "pixQrCode.paid" || eventType === "PIXQRCODE_PAID" ||
      eventType === "billing.paid" || eventType === "BILLING_PAID") {

      // Try to extract PIX ID from different possible locations in the payload
      const pixQrCode = body.data?.pixQrCode || body.pixQrCode || body.data;
      const pixId = pixQrCode?.id || body.pixQrCodeId || body.id;

      if (!pixId) {
        console.error("No PIX ID in webhook payload");
        return new Response(JSON.stringify({ received: true, warning: "No PIX ID found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Processing paid PIX:", pixId);

      // Find and update the pix_payments record
      const { data: pixPayment, error: findError } = await supabase
        .from("pix_payments")
        .select("*")
        .eq("pix_id", pixId)
        .single();

      if (findError || !pixPayment) {
        console.error("PIX payment not found");
        return new Response(JSON.stringify({ received: true, warning: "Payment not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update pix_payments status
      const { error: updateError } = await supabase
        .from("pix_payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("pix_id", pixId);

      if (updateError) {
        console.error("Error updating PIX payment:", updateError);
      } else {
        console.log("PIX payment marked as paid successfully");

        // Notify admins about the new payment
        try {
          const { data: admins } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin");

          if (admins && admins.length > 0) {
            const adminUserIds = admins.map(a => a.user_id);

            // Create system alert for admins
            await supabase.from("system_alerts").insert({
              title: "💰 Novo Pagamento PIX Confirmado!",
              message: `${pixPayment.customer_name} pagou R$ ${(pixPayment.amount / 100).toFixed(2)}`,
              type: "payment",
              priority: "high",
              target_type: "role",
              target_role: "admin",
              target_user_ids: adminUserIds,
              sent_by: "system",
              send_email: false,
            });

            console.log("Admin notification created for payment:", pixPayment.id);
          }
        } catch (notifyError) {
          console.error("Error creating admin notification:", notifyError);
        }
      }

      // Get user ID from metadata if available
      const metadata = pixPayment.metadata as Record<string, unknown> | null;
      const userId = metadata?.userId as string | undefined;
      const planTypeRaw = metadata?.planType as string | undefined;
      const planType = (planTypeRaw === "basic" || planTypeRaw === "pro")
        ? planTypeRaw
        : (pixPayment.amount <= 1990 ? "basic" : "pro");

      // If we have a user ID, activate their subscription
      if (userId) {
        console.log("Activating subscription for user:", userId);

        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (existingSub) {
          // Update existing subscription
          const { error: subError } = await supabase
            .from("user_subscriptions")
            .update({
              status: "active",
              plan_type: planType,
              started_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
              next_billing_at: expiresAt.toISOString(),
              payment_method: "pix_abacatepay",
              updated_at: now.toISOString(),
            })
            .eq("user_id", userId);

          if (subError) {
            console.error("Error updating subscription:", subError);
          } else {
            console.log("Subscription updated for user:", userId);
          }
        } else {
          // Create new subscription
          const { error: subError } = await supabase
            .from("user_subscriptions")
            .insert({
              user_id: userId,
              status: "active",
              plan_type: planType,
              started_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
              next_billing_at: expiresAt.toISOString(),
              payment_method: "pix_abacatepay",
            });

          if (subError) {
            console.error("Error creating subscription:", subError);
          } else {
            console.log("Subscription created for user:", userId);
          }
        }

        // Also create a payment record for tracking
        await supabase.from("payments").insert({
          user_id: userId,
          amount_cents: pixPayment.amount,
          status: "paid",
          method: "pix",
          paid_at: now.toISOString(),
          metadata: {
            pix_payment_id: pixPayment.id,
            pix_id: pixId,
            provider: "abacatepay",
          },
        });
      }

      console.log("Payment processed successfully via webhook");
    }

    return new Response(JSON.stringify({ received: true, processed: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
