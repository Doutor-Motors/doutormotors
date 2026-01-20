import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pixId } = await req.json();

    if (!pixId) {
      return new Response(
        JSON.stringify({ success: false, error: "pixId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const abacatePayApiKey = Deno.env.get("ABACATEPAY_API_KEY");
    if (!abacatePayApiKey) {
      console.error("ABACATEPAY_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API key não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Simulating payment for PIX ID: ${pixId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call AbacatePay simulate endpoint
    const simulateResponse = await fetch("https://api.abacatepay.com/v1/pixQrCode/simulate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${abacatePayApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: pixId }),
    });

    const simulateData = await simulateResponse.json();
    console.log("AbacatePay simulate response:", JSON.stringify(simulateData, null, 2));

    if (!simulateResponse.ok) {
      console.error("AbacatePay simulate error:", simulateData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: simulateData.error?.message || "Erro ao simular pagamento",
          details: simulateData
        }),
        { status: simulateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the pix_payments record to get metadata
    const { data: pixPayment, error: findError } = await supabase
      .from("pix_payments")
      .select("*")
      .eq("pix_id", pixId)
      .single();

    if (findError || !pixPayment) {
      console.error("PIX payment not found:", findError);
      return new Response(
        JSON.stringify({ success: false, error: "Pagamento PIX não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the pix_payments record
    const { error: updateError } = await supabase
      .from("pix_payments")
      .update({ 
        status: "paid",
        paid_at: new Date().toISOString()
      })
      .eq("pix_id", pixId);

    if (updateError) {
      console.error("Error updating pix_payments:", updateError);
    }

    // Extract user info from metadata and activate subscription
    // This is critical for simulation mode where webhook may not be triggered
    const metadata = pixPayment.metadata as Record<string, unknown> | null;
    const userId = metadata?.userId as string | undefined;
    const planTypeRaw = metadata?.planType as string | undefined;
    const planType = (planTypeRaw === "basic" || planTypeRaw === "pro")
      ? planTypeRaw
      : (pixPayment.amount <= 1990 ? "basic" : "pro");

    let subscriptionActivated = false;

    if (userId) {
      console.log("Activating subscription for user:", userId, "plan:", planType);

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
          subscriptionActivated = true;
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
          subscriptionActivated = true;
        }
      }

      // Also create a payment record for tracking
      if (subscriptionActivated) {
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
            simulated: true,
          },
        });
      }
    } else {
      console.warn("No userId in pix_payments metadata, cannot activate subscription");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: subscriptionActivated 
          ? "Pagamento simulado e assinatura ativada com sucesso!"
          : "Pagamento simulado com sucesso! (Assinatura não ativada - userId não encontrado)",
        subscriptionActivated,
        data: simulateData
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in simulate-pix-payment:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
