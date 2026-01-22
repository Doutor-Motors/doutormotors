import { tutorialFetchSchema, validateRequest, errorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TutorialContent {
  title: string;
  description: string;
  steps: Array<{
    number: number;
    title: string;
    content: string;
    tips?: string[];
  }>;
  tools: string[];
  parts: string[];
  warnings: string[];
  estimatedTime: string;
  difficulty: string;
  videoUrl?: string;
  sourceUrl: string;
}

const GEMINI_TUTORIAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "integer" },
          title: { type: "string" },
          content: { type: "string" },
          tips: { type: "array", items: { type: "string" } }
        },
        required: ["number", "title", "content"]
      }
    },
    tools: { type: "array", items: { type: "string" } },
    parts: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
    estimatedTime: { type: "string" },
    difficulty: { type: "string", enum: ["fácil", "intermediário", "difícil"] }
  },
  required: ["title", "description", "steps", "tools", "parts", "warnings", "estimatedTime", "difficulty"]
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const validation = await validateRequest(req, tutorialFetchSchema);
    if (validation.error) {
      console.error("Validation error:", validation.error);
      return errorResponse(validation.error, 400, corsHeaders);
    }

    const { url, vehicleBrand, vehicleModel, vehicleYear } = validation.data!;

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    // Usaremos GEMINI_API_KEY em vez de Lovable
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      return errorResponse("Firecrawl not configured", 500, corsHeaders);
    }

    console.log("Fetching tutorial from:", url);

    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error("Scrape error:", scrapeResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch tutorial content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData.data?.markdown || "";
    const html = scrapeData.data?.html || "";
    const metadata = scrapeData.data?.metadata || {};

    const videoUrl = extractVideoUrl(markdown, html);

    // Fallback if no AI Key
    if (!GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY not found, using raw parsing");
      const basicContent: TutorialContent = {
        title: metadata.title || "Tutorial",
        description: metadata.description || "",
        steps: parseBasicSteps(markdown),
        tools: extractTools(markdown),
        parts: extractParts(markdown),
        warnings: extractWarnings(markdown),
        estimatedTime: "30 min",
        difficulty: "intermediário",
        videoUrl: videoUrl,
        sourceUrl: url,
      };

      return new Response(
        JSON.stringify({ success: true, content: basicContent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process with Gemini
    const vehicleContext = vehicleBrand
      ? `Veículo: ${vehicleBrand} ${vehicleModel || ""} ${vehicleYear || ""}`
      : "";

    const prompt = `Você é um especialista em mecânica automotiva. Processe o tutorial abaixo e crie um guia estruturado em Português Brasileiro.

${vehicleContext}

Conteúdo Original (pode estar em inglês - TRADUZA):
${markdown.substring(0, 10000)}

Objetivo:
1. Traduzir para PT-BR.
2. Extrair passos claros e numerados com Dicas.
3. Listar ferramentas e peças.
4. Identificar avisos de segurança.
5. Manter precisão técnica.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: GEMINI_TUTORIAL_SCHEMA
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini Error:", await response.text());
      throw new Error("Erro no processamento de IA");
    }

    const aiData = await response.json();
    const jsonText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) throw new Error("Empty AI response");

    const processedContent = JSON.parse(jsonText);

    const content: TutorialContent = {
      ...processedContent,
      videoUrl: videoUrl,
      sourceUrl: url,
    };

    return new Response(
      JSON.stringify({ success: true, content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching tutorial:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper Functions (mantidas para fallback e extração de videoUrl)
function parseBasicSteps(markdown: string): Array<{ number: number; title: string; content: string }> {
  const steps: Array<{ number: number; title: string; content: string }> = [];
  const stepRegex = /(?:step\s*)?(\d+)[.:\s]+(.+?)(?=(?:step\s*)?\d+[.:\s]|$)/gis;
  let match;
  while ((match = stepRegex.exec(markdown)) !== null) {
    steps.push({
      number: parseInt(match[1]),
      title: `Passo ${match[1]}`,
      content: match[2].trim().substring(0, 500),
    });
  }
  if (steps.length === 0) {
    const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 50);
    paragraphs.slice(0, 6).forEach((p, i) => {
      steps.push({ number: i + 1, title: `Passo ${i + 1}`, content: p.trim().substring(0, 500) });
    });
  }
  return steps.length > 0 ? steps : [{ number: 1, title: "Passo 1", content: "Consulte o link original." }];
}

function extractTools(markdown: string): string[] {
  // Simplificado para fallback, já que IA fará o trabalho pesado
  return markdown.toLowerCase().includes("wrench") ? ["Chaves diversas"] : ["Ferramentas básicas"];
}

function extractParts(markdown: string): string[] {
  return [];
}

function extractWarnings(markdown: string): string[] {
  return markdown.toLowerCase().includes("warning") ? ["Siga instruções de segurança"] : [];
}

function extractVideoUrl(markdown: string, html?: string): string | undefined {
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];

  for (const p of patterns) {
    const m = markdown.match(p);
    if (m) return m[0];
    if (html) {
      const m2 = html.match(p);
      if (m2) return m2[0];
    }
  }
  return undefined;
}
