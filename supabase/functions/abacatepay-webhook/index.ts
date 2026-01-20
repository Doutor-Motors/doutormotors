import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

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
    
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Validate webhook signature if secret is configured
    let signatureValid = false;
    if (webhookSecret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody)
      );
      
      const expectedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      
      signatureValid = signature === expectedSignature;
      
      if (!signatureValid) {
        console.warn("Invalid webhook signature - expected:", expectedSignature, "received:", signature);
      }
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
        console.log("PIX payment not found for ID:", pixId, findError);
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
        console.log("PIX payment marked as paid:", pixPayment.id);
      }

      // Get user ID from metadata if available
      const metadata = pixPayment.metadata as Record<string, unknown> | null;
      const userId = metadata?.userId as string | undefined;
      const planType = (metadata?.planType as string) || "pro";

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
