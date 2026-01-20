import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valor mínimo do plano PRO em centavos (R$ 29,90)
const MINIMUM_PLAN_AMOUNT_CENTS = 2990;

interface CreatePixRequest {
  amount: number; // em centavos
  expiresIn?: number;
  description?: string;
  customer: {
    name: string;
    cellphone: string;
    email: string;
    taxId: string;
  };
  metadata?: {
    externalId?: string;
    planType?: string;
    userId?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
    if (!apiKey) {
      console.error("ABACATEPAY_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreatePixRequest = await req.json();
    console.log("Received request:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return new Response(JSON.stringify({ error: "Amount is required and must be positive" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // VALIDAÇÃO CRÍTICA: Valor mínimo do plano
    if (body.amount < MINIMUM_PLAN_AMOUNT_CENTS) {
      console.error(`Amount ${body.amount} is less than minimum ${MINIMUM_PLAN_AMOUNT_CENTS}`);
      return new Response(JSON.stringify({ 
        error: "Valor abaixo do mínimo permitido",
        message: `O valor mínimo para assinatura do plano é R$ ${(MINIMUM_PLAN_AMOUNT_CENTS / 100).toFixed(2).replace('.', ',')}. Por favor, insira o valor correto do plano.`,
        minAmount: MINIMUM_PLAN_AMOUNT_CENTS,
        providedAmount: body.amount
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.customer?.name || !body.customer?.email || !body.customer?.taxId) {
      return new Response(JSON.stringify({ error: "Customer name, email and taxId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate external ID for tracking
    const externalId = body.metadata?.externalId || crypto.randomUUID();

    // Call AbacatePay PIX QRCode API with customer data (as per their documentation)
    console.log("Calling AbacatePay PIX QRCode API...");
    
    const pixPayload = {
      amount: body.amount, // AbacatePay expects cents
      expiresIn: body.expiresIn || 3600, // seconds (default 1 hour)
      description: body.description || "Assinatura Doutor Motors Pro",
      customer: {
        name: body.customer.name,
        cellphone: body.customer.cellphone || "",
        email: body.customer.email,
        taxId: body.customer.taxId.replace(/\D/g, ""), // Remove formatting from CPF
      },
      metadata: {
        externalId: externalId,
        userId: body.metadata?.userId || "",
        planType: body.metadata?.planType || "pro",
      }
    };

    console.log("AbacatePay PIX payload:", JSON.stringify(pixPayload, null, 2));

    const pixResponse = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(pixPayload),
    });

    const pixData = await pixResponse.json();
    console.log("AbacatePay PIX response:", JSON.stringify(pixData, null, 2));

    if (!pixResponse.ok || pixData.error) {
      console.error("AbacatePay PIX error:", pixData);
      return new Response(JSON.stringify({ 
        error: pixData.error || "Failed to create PIX QRCode",
        details: pixData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract data from PIX response
    const pix = pixData.data;
    
    const pixId = pix?.id;
    const brCode = pix?.brCode;
    const brCodeBase64 = pix?.brCodeBase64;
    const pixExpiresAt = pix?.expiresAt;
    
    if (!pixId || !brCode) {
      console.error("No PIX data in response:", pixData);
      return new Response(JSON.stringify({ 
        error: "No PIX data returned from payment provider",
        details: pixData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the base64 QR code from AbacatePay or generate one
    const qrCodeUrl = brCodeBase64 
      ? `data:image/png;base64,${brCodeBase64}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(brCode)}`;
    
    console.log("PIX created:", pixId, "brCode length:", brCode.length);

    // Use expiration from AbacatePay response or calculate
    const paymentExpiresAt = pixExpiresAt || new Date(Date.now() + (body.expiresIn || 3600) * 1000).toISOString();

    // Save to database
    const { data: payment, error: dbError } = await supabase
      .from("pix_payments")
      .insert({
        pix_id: pixId,
        amount: body.amount, // Store as cents (integer)
        status: "pending",
        br_code: brCode, // Store the actual PIX brCode
        qr_code_url: qrCodeUrl,
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        customer_cellphone: body.customer.cellphone,
        customer_tax_id: body.customer.taxId,
        description: body.description || "Assinatura Doutor Motors Pro",
        metadata: { 
          externalId: externalId,
          devMode: pix.devMode,
          originalAmount: body.amount,
          planType: body.metadata?.planType || "pro",
          userId: body.metadata?.userId,
        },
        expires_at: paymentExpiresAt,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Payment created:", payment.id, "Amount:", body.amount, "cents");

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: payment.id,
        pix_id: pixId,
        amount: body.amount, // Return in cents
        status: "pending",
        br_code: brCode,
        qr_code_url: qrCodeUrl,
        expires_at: paymentExpiresAt,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error creating PIX payment:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
