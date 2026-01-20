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

  // Only accept POST requests
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
    
    // Parse the request body
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Validate webhook signature if secret is configured
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
        encoder.encode(JSON.stringify(body))
      );
      
      const expectedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      
      if (signature !== expectedSignature) {
        console.warn("Invalid webhook signature");
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types from AbacatePay
    const eventType = body.event || body.type;
    console.log("Event type:", eventType);

    // Handle billing paid event
    if (eventType === "billing.paid" || eventType === "BILLING_PAID") {
      const billing = body.billing || body.data?.billing || body.data;
      const billingId = billing?.id || body.billingId;
      
      if (!billingId) {
        console.error("No billing ID in webhook");
        return new Response(JSON.stringify({ received: true, warning: "No billing ID" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Processing paid billing:", billingId);

      // Update pix_payments table (for checkout demo)
      const { data: pixPayment, error: pixError } = await supabase
        .from("pix_payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("pix_id", billingId)
        .select()
        .single();

      if (pixError) {
        console.log("PIX payment not found or update failed:", pixError);
      } else {
        console.log("PIX payment updated:", pixPayment?.id);
      }

      // Also update regular payments table (for subscriptions)
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("*, user_subscriptions(*)")
        .or(`picpay_charge_id.eq.${billingId},metadata->abacatepay_billing_id.eq.${billingId}`)
        .single();

      if (!paymentError && payment) {
        console.log("Found subscription payment:", payment.id);

        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            picpay_end_to_end_id: body.payment?.id || null,
            metadata: {
              ...((payment.metadata as Record<string, unknown>) || {}),
              abacatepay_payment: body.payment,
              paid_via: "abacatepay_webhook",
            },
          })
          .eq("id", payment.id);

        // Activate subscription if exists
        if (payment.subscription_id) {
          const now = new Date();
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          await supabase
            .from("user_subscriptions")
            .update({
              status: "active",
              started_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
              next_billing_at: expiresAt.toISOString(),
              payment_method: "pix_abacatepay",
            })
            .eq("id", payment.subscription_id);

          console.log("Subscription activated:", payment.subscription_id);
        }
      }

      console.log("Payment processed successfully");
    }

    return new Response(JSON.stringify({ received: true }), {
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
