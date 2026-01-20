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

    // Update local pix_payments table to reflect the simulated payment
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      // Don't fail - the webhook should handle this too
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Pagamento simulado com sucesso! O webhook será disparado automaticamente.",
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
