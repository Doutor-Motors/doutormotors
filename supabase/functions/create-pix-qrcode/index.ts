import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePixRequest {
  amount: number;
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

    if (!body.customer?.name || !body.customer?.email || !body.customer?.taxId) {
      return new Response(JSON.stringify({ error: "Customer name, email and taxId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call AbacatePay API
    console.log("Calling AbacatePay API...");
    const abacatePayload = {
      billing: {
        methods: ["PIX"],
        products: [
          {
            externalId: body.metadata?.externalId || `pix-${Date.now()}`,
            name: body.description || "Pagamento PIX",
            quantity: 1,
            price: body.amount,
          }
        ],
        returnUrl: "https://example.com/return",
        completionUrl: "https://example.com/completion",
        customer: {
          name: body.customer.name,
          cellphone: body.customer.cellphone?.replace(/\D/g, "") || "",
          email: body.customer.email,
          taxId: body.customer.taxId.replace(/\D/g, ""),
        }
      }
    };

    console.log("AbacatePay payload:", JSON.stringify(abacatePayload, null, 2));

    const abacateResponse = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(abacatePayload),
    });

    const abacateData = await abacateResponse.json();
    console.log("AbacatePay response:", JSON.stringify(abacateData, null, 2));

    if (!abacateResponse.ok || abacateData.error) {
      console.error("AbacatePay error:", abacateData);
      return new Response(JSON.stringify({ 
        error: abacateData.error || "Failed to create PIX payment",
        details: abacateData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract PIX data from response
    const billing = abacateData.data;
    const pixMethod = billing?.pixQrCode;
    
    if (!pixMethod) {
      console.error("No PIX data in response:", abacateData);
      return new Response(JSON.stringify({ 
        error: "No PIX data returned from payment provider",
        details: abacateData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (body.expiresIn || 30));

    // Save to database
    const { data: payment, error: dbError } = await supabase
      .from("pix_payments")
      .insert({
        pix_id: billing.id,
        amount: body.amount,
        status: "pending",
        br_code: pixMethod.brcode,
        qr_code_url: pixMethod.base64,
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        customer_cellphone: body.customer.cellphone,
        customer_tax_id: body.customer.taxId,
        description: body.description,
        metadata: body.metadata || {},
        expires_at: expiresAt.toISOString(),
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

    console.log("Payment created:", payment.id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: payment.id,
        pix_id: billing.id,
        amount: body.amount,
        status: "pending",
        br_code: pixMethod.brcode,
        qr_code_url: pixMethod.base64,
        expires_at: expiresAt.toISOString(),
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
