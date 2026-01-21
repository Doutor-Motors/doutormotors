import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Tutorial {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  slug: string;
  score: number;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Extract keywords and search context from query using AI
    const extractionPrompt = `Analise esta pergunta de um usuário sobre veículos e extraia:
1. Palavras-chave principais (máximo 5)
2. Categoria do problema (ex: motor, freios, elétrica, suspensão, etc.)
3. Intenção do usuário (ex: diagnóstico, manutenção, reparo, entender funcionamento)

Pergunta: "${query}"
${vehicleContext ? `Veículo: ${vehicleContext.brand} ${vehicleContext.model} ${vehicleContext.year}` : ""}

Responda em JSON:
{
  "keywords": ["palavra1", "palavra2"],
  "category": "categoria",
  "intent": "intenção",
  "searchTerms": ["termo de busca 1", "termo de busca 2"]
}`;

    const extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: extractionPrompt }],
        temperature: 0.3,
      }),
    });

    if (!extractionResponse.ok) {
      console.error("AI extraction failed:", await extractionResponse.text());
      throw new Error("Failed to analyze query");
    }

    const extractionData = await extractionResponse.json();
    let extracted: {
      keywords: string[];
      category: string;
      intent: string;
      searchTerms: string[];
    };

    try {
      const content = extractionData.choices?.[0]?.message?.content || "{}";
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      extracted = JSON.parse(cleanContent);
    } catch {
      extracted = {
        keywords: query.split(" ").filter((w: string) => w.length > 3).slice(0, 5),
        category: "geral",
        intent: "diagnóstico",
        searchTerms: [query],
      };
    }

    console.log("Extracted context:", extracted);

    // 2. Search tutorials with expanded terms
    const allSearchTerms = [...new Set([
      ...extracted.keywords,
      ...extracted.searchTerms,
      extracted.category,
    ])].filter(Boolean);

    // Build OR conditions for search
    const orConditions = allSearchTerms
      .flatMap(term => [
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

    if (error) {
      console.error("Database search error:", error);
      throw error;
    }

    if (!tutorials || tutorials.length === 0) {
      return new Response(
        JSON.stringify({ tutorials: [], message: "Nenhum tutorial encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Re-rank using AI
    const tutorialsSummary = tutorials.map((t, i) => ({
      index: i,
      title: t.title_pt || t.title_original,
      description: t.description_pt?.substring(0, 100) || "",
      category: t.category_pt || "",
    }));

    const rankingPrompt = `Você é um assistente que ranqueia tutoriais automotivos por relevância.

Pergunta do usuário: "${query}"
${vehicleContext ? `Veículo: ${vehicleContext.brand} ${vehicleContext.model} ${vehicleContext.year}` : ""}
Intenção detectada: ${extracted.intent}
Categoria detectada: ${extracted.category}

Tutoriais disponíveis:
${JSON.stringify(tutorialsSummary, null, 2)}

Retorne os índices dos ${Math.min(limit, tutorials.length)} tutoriais MAIS RELEVANTES em ordem de relevância (do mais relevante para o menos), junto com um score de 0 a 100.

Responda APENAS em JSON:
{
  "rankings": [
    { "index": 0, "score": 95, "reason": "motivo breve" },
    { "index": 2, "score": 80, "reason": "motivo breve" }
  ]
}`;

    const rankingResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: rankingPrompt }],
        temperature: 0.1,
      }),
    });

    if (!rankingResponse.ok) {
      console.error("AI ranking failed:", await rankingResponse.text());
      // Fallback: return tutorials as-is with default scores
      const fallbackTutorials: Tutorial[] = tutorials.slice(0, limit).map((t, i) => ({
        id: t.id,
        title: t.title_pt || t.title_original || "Tutorial",
        description: t.description_pt || undefined,
        category: t.category_pt || undefined,
        thumbnail: t.thumbnail_url || undefined,
        slug: t.slug,
        score: 100 - (i * 10),
      }));

      return new Response(
        JSON.stringify({ tutorials: fallbackTutorials, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rankingData = await rankingResponse.json();
    let rankings: { index: number; score: number; reason?: string }[];

    try {
      const content = rankingData.choices?.[0]?.message?.content || "{}";
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      rankings = parsed.rankings || [];
    } catch {
      // Fallback to first N tutorials
      rankings = tutorials.slice(0, limit).map((_, i) => ({
        index: i,
        score: 100 - (i * 10),
      }));
    }

    // 4. Build final response
    const rankedTutorials: Tutorial[] = rankings
      .filter((r) => r.index >= 0 && r.index < tutorials.length)
      .slice(0, limit)
      .map((r) => {
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

    console.log("Returning", rankedTutorials.length, "ranked tutorials");

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
    console.error("semantic-tutorial-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
