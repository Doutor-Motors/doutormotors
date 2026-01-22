import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Schemas for Gemini
const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    keywords: { type: "array", items: { type: "string" } },
    category: { type: "string" },
    intent: { type: "string" },
    searchTerms: { type: "array", items: { type: "string" } }
  },
  required: ["keywords", "category", "intent", "searchTerms"]
};

const RANKING_SCHEMA = {
  type: "object",
  properties: {
    rankings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          score: { type: "integer" },
          reason: { type: "string" }
        },
        required: ["index", "score"]
      }
    }
  },
  required: ["rankings"]
};

async function callGemini(prompt: string, schema: any, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: schema
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("Empty AI response");

  return JSON.parse(jsonText);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, vehicleContext, limit = 4 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Extract keywords
    const extractionPrompt = `Analise esta pergunta de um usuário sobre veículos e extraia metadados para busca.
Pergunta: "${query}"
${vehicleContext ? `Veículo: ${vehicleContext.brand} ${vehicleContext.model} ${vehicleContext.year}` : ""}

Objetivo: Retornar JSON com keywords, categoria, intenção e termos de busca alternativos.`;

    let extracted: any = {};
    try {
      extracted = await callGemini(extractionPrompt, EXTRACTION_SCHEMA, GEMINI_API_KEY);
    } catch (e) {
      console.error("Extraction failed", e);
      // Fallback
      extracted = {
        keywords: query.split(" ").filter((w: string) => w.length > 3).slice(0, 5),
        category: "geral",
        intent: "busca",
        searchTerms: [query],
      };
    }

    console.log("Extracted:", extracted);

    // 2. Search database
    const allSearchTerms = [...new Set([
      ...extracted.keywords,
      ...extracted.searchTerms,
      extracted.category,
    ])].filter(Boolean);

    const orConditions = allSearchTerms
      .flatMap((term: string) => [
        `title_pt.ilike.%${term}%`,
        `title_original.ilike.%${term}%`,
        `description_pt.ilike.%${term}%`,
        `category_pt.ilike.%${term}%`,
      ])
      .join(",");

    const { data: tutorials, error } = await supabase
      .from("tutorial_cache")
      .select("id, title_pt, title_original, description_pt, category_pt, thumbnail_url, slug")
      .or(orConditions)
      .limit(20);

    if (error) throw error;

    if (!tutorials || tutorials.length === 0) {
      return new Response(
        JSON.stringify({ tutorials: [], message: "Nenhum tutorial encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Re-rank results
    const tutorialsSummary = tutorials.map((t: any, i: number) => ({
      index: i,
      title: t.title_pt || t.title_original,
      description: t.description_pt?.substring(0, 100) || "",
      category: t.category_pt || "",
    }));

    const rankingPrompt = `Ranqueie estes tutoriais para a pergunta: "${query}"
Intenção: ${extracted.intent}
Categoria: ${extracted.category}

Tutoriais: ${JSON.stringify(tutorialsSummary)}

Retorne indices dos ${Math.min(limit, tutorials.length)} melhores e scores (0-100).`;

    let rankings = [];
    try {
      const rankingData = await callGemini(rankingPrompt, RANKING_SCHEMA, GEMINI_API_KEY);
      rankings = rankingData.rankings || [];
    } catch (e) {
      console.error("Ranking failed", e);
      rankings = tutorials.slice(0, limit).map((_: any, i: number) => ({ index: i, score: 90 - i }));
    }

    // 4. Build response
    const rankedTutorials = rankings
      .filter((r: any) => r.index >= 0 && r.index < tutorials.length)
      .slice(0, limit)
      .map((r: any) => {
        const t = tutorials[r.index];
        return {
          id: t.id,
          title: t.title_pt || t.title_original || "Tutorial",
          description: t.description_pt || undefined,
          category: t.category_pt || undefined,
          thumbnail: t.thumbnail_url || undefined,
          slug: t.slug,
          score: r.score,
        };
      });

    return new Response(
      JSON.stringify({
        tutorials: rankedTutorials,
        context: {
          keywords: extracted.keywords,
          category: extracted.category,
          intent: extracted.intent,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
