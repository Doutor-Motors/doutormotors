import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  generateStaticFallbackSteps,
  formatProcedureTitle,
  translateCategoryName,
  formatBrandName,
  formatModelName,
  getCategoryIcon
} from "./static_data.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CarCareRequest {
  action: "brands" | "models" | "videos" | "video-details" | "search" | "scan-and-cache" | "get-cached" | "list-categories";
  brand?: string;
  model?: string;
  year?: string;
  procedure?: string;
  query?: string;
  skipCache?: boolean; // Force reprocessing, ignore cache
}

interface CachedTranscription {
  id: string;
  video_url: string;
  youtube_video_id: string | null;
  original_transcription: string | null;
  elaborated_steps: string[] | null;
  translated_title: string | null;
  translated_description: string | null;
  translated_video_description: string | null;
  transcription_used: boolean;
  vehicle_context: string | null;
  expires_at: string;
}

// Inicializar Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Verificar cache de transcrição - só retorna cache válido (com videoUrl ou steps válidos)
async function getCachedTranscription(videoUrl: string): Promise<CachedTranscription | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("video_transcription_cache")
      .select("*")
      .eq("video_url", videoUrl)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Error fetching cache:", error);
      return null;
    }

    // VALIDAÇÃO: Não retornar cache inválido (sem vídeo E sem steps)
    if (data) {
      const hasValidVideo = data.youtube_video_id && data.youtube_video_id.length === 11;
      const hasValidSteps = data.elaborated_steps && Array.isArray(data.elaborated_steps) && data.elaborated_steps.length > 0;

      if (!hasValidVideo && !hasValidSteps) {
        console.log("Cache exists but is invalid (no video and no steps), ignoring:", videoUrl);
        // Deletar cache inválido para evitar reutilização
        await supabase
          .from("video_transcription_cache")
          .delete()
          .eq("video_url", videoUrl);
        return null;
      }

      console.log("Cache hit for video:", videoUrl, { hasValidVideo, hasValidSteps });
    }

    return data;
  } catch (err) {
    console.error("Cache lookup error:", err);
    return null;
  }
}


// Database Helpers
async function getBrandsFromDB(supabase: any) {
  const { data, error } = await supabase
    .from('car_care_brands')
    .select('id, name')
    .order('name');

  if (error) {
    console.error("DB Brands Error:", error);
    return [];
  }
  return data.map((b: any) => b.id);
}

async function getModelsFromDB(supabase: any, brandId: string) {
  const { data, error } = await supabase
    .from('car_care_models')
    .select('name, years, image, url, id')
    .eq('brand_id', brandId)
    .order('name');

  if (error) {
    console.error("DB Models Error:", error);
    return {};
  }

  // Return flat array for compatibility with scraper functions
  return data.map((m: any) => ({
    id: m.id,
    name: m.name,
    years: m.years,
    image: m.image,
    url: m.url
  }));
}

async function getCategoriesWithProceduresFromDB(supabase: any) {
  const { data: categories, error: catError } = await supabase
    .from('car_care_categories')
    .select('id, name, name_en, icon')
    .order('name');

  if (catError) {
    console.error("DB Categories Error:", catError);
    return [];
  }

  const { data: procedures, error: procError } = await supabase
    .from('car_care_procedures')
    .select('id, category_id, name, name_en');

  if (procError) {
    console.error("DB Procedures Error:", procError);
    return [];
  }

  return categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    nameEn: cat.name_en,
    icon: cat.icon,
    procedures: procedures
      .filter((p: any) => p.category_id === cat.id)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        nameEn: p.name_en
      }))
  }));
}

// Salvar transcrição no cache - só salva se tiver conteúdo válido
async function saveToCache(cacheData: {
  video_url: string;
  youtube_video_id?: string;
  original_transcription?: string;
  elaborated_steps?: string[];
  translated_title?: string;
  translated_description?: string;
  translated_video_description?: string;
  transcription_used: boolean;
  vehicle_context?: string;
}): Promise<void> {
  try {
    // VALIDAÇÃO: Não salvar cache se não tiver vídeo válido E não tiver steps válidos
    const hasValidVideo = cacheData.youtube_video_id && cacheData.youtube_video_id.length === 11;
    const hasValidSteps = cacheData.elaborated_steps && cacheData.elaborated_steps.length > 0;

    if (!hasValidVideo && !hasValidSteps) {
      console.log("Not caching invalid data (no video and no steps):", cacheData.video_url);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("video_transcription_cache")
      .upsert({
        ...cacheData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }, {
        onConflict: "video_url",
      });

    if (error) {
      console.error("Error saving to cache:", error);
    } else {
      console.log("Saved to cache:", cacheData.video_url, { hasValidVideo, hasValidSteps });
    }
  } catch (err) {
    console.error("Cache save error:", err);
  }
}

// Helper para chamadas Gemini
async function callGeminiAPI(prompt: string, schema: any, temperature = 0.4): Promise<any> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          response_mime_type: "application/json",
          response_schema: schema
        }
      })
    }
  );

  if (!response.ok) throw new Error(`Gemini Error: ${response.status} ${await response.text()}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty AI response");

  return JSON.parse(text);
}

// Extrair áudio do YouTube e transcrever usando ElevenLabs
async function transcribeYouTubeVideo(videoUrl: string): Promise<string | null> {
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

  if (!ELEVENLABS_API_KEY) {
    console.log("ELEVENLABS_API_KEY not configured, skipping transcription");
    return null;
  }

  try {
    // Extrair video ID do YouTube
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      console.log("Could not extract YouTube video ID");
      return null;
    }
    const videoId = videoIdMatch[1];

    console.log(`Transcribing YouTube video: ${videoId}...`);

    // Usar serviço de download de áudio do YouTube (via API pública)
    // Tentar obter o áudio via cobalt.tools (serviço gratuito)
    const cobaltResponse = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: "audio",
        audioBitrate: "128",
      }),
    });

    if (!cobaltResponse.ok) {
      console.log("Cobalt API error, trying alternative method...");

      // Tentar método alternativo: usar transcrição do próprio YouTube via API
      // Se não conseguir áudio, retornar null e usar passos do HTML
      return null;
    }

    const cobaltData = await cobaltResponse.json();
    const audioUrl = cobaltData.url;

    if (!audioUrl) {
      console.log("No audio URL received from Cobalt");
      return null;
    }

    // Baixar o áudio
    console.log("Downloading audio from:", audioUrl);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.log("Failed to download audio");
      return null;
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });

    // Criar FormData para enviar ao ElevenLabs
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model_id", "scribe_v2");
    formData.append("language_code", "eng");

    console.log("Sending audio to ElevenLabs for transcription...");

    const transcribeResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!transcribeResponse.ok) {
      console.error("ElevenLabs transcription error:", transcribeResponse.status);
      const errorText = await transcribeResponse.text();
      console.error("Error details:", errorText);
      return null;
    }

    const transcription = await transcribeResponse.json();
    console.log("Transcription successful:", transcription.text?.slice(0, 200) + "...");

    return transcription.text || null;
  } catch (error) {
    console.error("Transcription error:", error);
    return null;
  }
}

// Gerar passo a passo elaborado a partir da transcrição
async function generateElaboratedSteps(
  transcription: string,
  title: string,
  vehicleContext?: string
): Promise<string[]> {
  try {
    console.log("Generating elaborated steps from transcription with Gemini...");

    const STEPS_SCHEMA = {
      type: "array",
      items: { type: "string" }
    };

    const prompt = `Analise a transcrição de vídeo e crie um tutorial estruturado em passos (array de strings).
    
    Contexto: ${title} ${vehicleContext ? " - " + vehicleContext : ""}
    Transcrição: ${transcription.slice(0, 8000)}
    
    Regras:
    1. Passos claros e sequenciais em Português Brasileiro.
    2. Numere com emojis (1️⃣, 2️⃣...).
    3. Inclua avisos de segurança (⚠️) se necessário.
    4. Max 15 passos.`;

    const steps = await callGeminiAPI(prompt, STEPS_SCHEMA);
    return Array.isArray(steps) ? steps : [];
  } catch (error) {
    console.error("Step generation error:", error);
    return [];
  }
}

// Traduzir conteúdo para português usando Gemini
async function translateToPortuguese(content: {
  title?: string;
  description?: string;
  videoDescription?: string;
  steps?: string[];
}): Promise<{
  title?: string;
  description?: string;
  videoDescription?: string;
  steps?: string[];
}> {
  try {
    const keys = Object.keys(content).filter(k => content[k as keyof typeof content]);
    if (keys.length === 0) return content;

    console.log(`Translating content to Portuguese with Gemini...`);

    const TRANSLATION_SCHEMA = {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        videoDescription: { type: "string" },
        steps: { type: "array", items: { type: "string" } }
      }
    };

    const prompt = `Traduza o seguinte JSON para Português Brasileiro (pt-BR).
    Mantenha termos técnicos. Retorne JSON com a mesma estrutura.
    
    Conteúdo: ${JSON.stringify(content)}`;

    const translated = await callGeminiAPI(prompt, TRANSLATION_SCHEMA);

    // Merge result
    return { ...content, ...translated };
  } catch (error) {
    console.error("Translation error:", error);
    return content;
  }
}

// Gerar passos com IA baseado no título e contexto
async function generateStepsWithAI(
  title: string,
  description: string,
  vehicleContext?: string
): Promise<string[]> {
  try {
    console.log("Generating steps with Gemini for:", title);

    const STEPS_SCHEMA = {
      type: "array",
      items: { type: "string" }
    };

    const prompt = `Crie um tutorial passo a passo profissional para o procedimento automotivo.
    
    Procedimento: ${title}
    Descrição: ${description}
    Veículo: ${vehicleContext || "Genérico"}
    
    Regras:
    1. 6 a 10 passos detalhados.
    2. Numere com emojis.
    3. Use texto em negrito para ênfase (markdown).
    4. Português Brasileiro.`;

    const steps = await callGeminiAPI(prompt, STEPS_SCHEMA);
    return Array.isArray(steps) ? steps : [];
  } catch (error) {
    console.error("Step generation error:", error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as CarCareRequest;
    const { action, brand, model, year, procedure, query, skipCache } = body;

    console.log("CarCare API request:", { action, brand, model, year, procedure, query, skipCache });

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    // Se não tiver API key, usar dados estáticos diretamente
    const useStaticOnly = !FIRECRAWL_API_KEY;

    if (useStaticOnly) {
      console.log("Using static data only (no Firecrawl API key)");
    }

    switch (action) {
      case "brands": {
        if (useStaticOnly) {
          const supabase = getSupabaseClient();
          const brands = await getBrandsFromDB(supabase);
          return new Response(
            JSON.stringify({ success: true, data: brands }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const brands = await fetchBrandsFromCarCareKiosk(FIRECRAWL_API_KEY);
        return new Response(
          JSON.stringify({ success: true, data: brands }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "models": {
        if (!brand) {
          return new Response(
            JSON.stringify({ success: false, error: "Brand is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (useStaticOnly) {
          const supabase = getSupabaseClient();
          const modelsData = await getModelsFromDB(supabase, brand);

          // Re-group for the client-side grouped view
          const models: Record<string, any> = {};
          modelsData.forEach((m: any) => {
            if (!models[m.name]) {
              models[m.name] = {
                name: m.name,
                years: [],
                images: {},
                urls: {}
              };
            }
            models[m.name].years.push(m.years);
            models[m.name].images[m.years] = m.image;
            models[m.name].urls[m.years] = m.url;
          });

          return new Response(
            JSON.stringify({ success: true, data: models }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const models = await fetchModelsFromCarCareKiosk(FIRECRAWL_API_KEY, brand);
        return new Response(
          JSON.stringify({ success: true, data: models }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "videos": {
        if (!brand || !model) {
          return new Response(
            JSON.stringify({ success: false, error: "Brand and model are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (useStaticOnly) {
          const supabase = getSupabaseClient();
          const categories = await getCategoriesWithProceduresFromDB(supabase);
          return new Response(
            JSON.stringify({ success: true, data: categories }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const videos = await fetchVideosFromCarCareKiosk(FIRECRAWL_API_KEY, brand, model, year);
        return new Response(
          JSON.stringify({ success: true, data: videos }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "video-details": {
        if (!procedure) {
          return new Response(
            JSON.stringify({ success: false, error: "Procedure/video URL is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (useStaticOnly) {
          return new Response(
            JSON.stringify({ success: true, data: null }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Build vehicle context for better step generation
        const vehicleContext = [brand, model, year].filter(Boolean).join(" ");
        const videoDetails = await fetchVideoDetails(FIRECRAWL_API_KEY, procedure, vehicleContext || undefined, skipCache);
        return new Response(
          JSON.stringify({ success: true, data: videoDetails }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "search": {
        if (!query) {
          return new Response(
            JSON.stringify({ success: false, error: "Query is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (useStaticOnly) {
          // No DB search implemented yet for simplicity, return empty or fallback
          return new Response(
            JSON.stringify({ success: true, data: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const results = await searchCarCareKiosk(FIRECRAWL_API_KEY, query, brand, model, year);
        return new Response(
          JSON.stringify({ success: true, data: results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "scan-and-cache": {
        if (!brand || !model) {
          return new Response(
            JSON.stringify({ success: false, error: "Brand and model are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (useStaticOnly) {
          return new Response(
            JSON.stringify({ success: false, error: "Firecrawl API key required for scanning" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await scanAndCacheProcedures(FIRECRAWL_API_KEY, brand, model, year || new Date().getFullYear().toString());
        return new Response(
          JSON.stringify({ success: true, ...result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-cached": {
        // Get procedures from cache for a specific vehicle
        const supabase = getSupabaseClient();
        let query = supabase
          .from("carcare_procedure_cache")
          .select("*")
          .gt("expires_at", new Date().toISOString());

        if (brand) query = query.eq("brand", brand);
        if (model) query = query.eq("model", model);
        if (year) query = query.eq("year", year);

        const { data, error } = await query.order("category").order("procedure_name");

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list-categories": {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("carcare_categories")
          .select("*")
          .order("name_en");

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("CarCare API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Buscar todas as marcas do CarCareKiosk
async function fetchBrandsFromCarCareKiosk(apiKey: string): Promise<any[]> {
  try {
    console.log("Fetching brands from CarCareKiosk...");

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.carcarekiosk.com/",
        formats: ["html"],
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl error fetching brands:", response.status);
      const supabase = getSupabaseClient();
      return await getBrandsFromDB(supabase);
    }

    const data = await response.json();
    const html = data.data?.html || "";

    const brands: any[] = [];
    const brandRegex = /<a[^>]*href="\/make\/([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi;

    let match;
    const seen = new Set();

    while ((match = brandRegex.exec(html)) !== null) {
      const [, brandSlug, imageUrl] = match;

      if (!seen.has(brandSlug) && brandSlug && !brandSlug.includes('/')) {
        seen.add(brandSlug);
        const brandName = formatBrandName(brandSlug);
        brands.push({
          id: brandSlug,
          name: brandName,
          image: imageUrl.startsWith('http') ? imageUrl : `https://www.carcarekiosk.com${imageUrl}`,
          url: `https://www.carcarekiosk.com/make/${brandSlug}`,
        });
      }
    }

    if (brands.length === 0) {
      const simpleRegex = /href="\/make\/([a-z0-9-]+)"/gi;
      while ((match = simpleRegex.exec(html)) !== null) {
        const brandSlug = match[1];
        if (!seen.has(brandSlug) && !brandSlug.includes('/')) {
          seen.add(brandSlug);
          const brandName = formatBrandName(brandSlug);
          brands.push({
            id: brandSlug,
            name: brandName,
            image: `https://www.carcarekiosk.com/imager/vehicles/2019_${brandName.replace(/\s+/g, '_')}/front.jpg`,
            url: `https://www.carcarekiosk.com/make/${brandSlug}`,
          });
        }
      }
    }

    console.log(`Found ${brands.length} brands from CarCareKiosk`);

    if (brands.length === 0) {
      const supabase = getSupabaseClient();
      return await getBrandsFromDB(supabase);
    }

    return brands.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching brands:", error);
    const supabase = getSupabaseClient();
    return await getBrandsFromDB(supabase);
  }
}

// Buscar modelos de uma marca do CarCareKiosk - NOVO FORMATO: /videos/Brand/Model/Year
async function fetchModelsFromCarCareKiosk(apiKey: string, brand: string): Promise<any[]> {
  try {
    // O CarCareKiosk usa múltiplos formatos de URL - tentar todos
    const urlFormats = [
      `https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}`,  // /videos/Honda
      `https://www.carcarekiosk.com/videos/${brand.replace(/\s+/g, "-")}`, // /videos/Land-Rover
      `https://www.carcarekiosk.com/make/${brand.toLowerCase().replace(/\s+/g, "-")}`, // Formato antigo: /make/honda
    ];

    let html = "";
    let successfulUrl = "";

    // Tentar cada formato de URL até encontrar um que funcione
    for (const url of urlFormats) {
      console.log(`Trying to fetch models for ${brand} from ${url}...`);

      try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["html", "markdown"],
            waitFor: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedHtml = data.data?.html || "";
          const markdown = data.data?.markdown || "";

          // Verificar se a página é válida (não é NOT FOUND)
          if (isValidPage(markdown, fetchedHtml) && fetchedHtml.length > 1000) {
            html = fetchedHtml;
            successfulUrl = url;
            console.log(`Successfully fetched from ${url} (${html.length} chars)`);
            break;
          } else {
            console.log(`Page from ${url} appears invalid, trying next format...`);
          }
        }
      } catch (e) {
        console.log(`Failed to fetch from ${url}:`, e);
      }
    }

    if (!html) {
      console.log("All URL formats failed, using DB models for", brand);
      const supabase = getSupabaseClient();
      return await getModelsFromDB(supabase, brand);
    }

    const models: any[] = [];
    const seen = new Set();

    // Padrão 1: Novo formato /videos/Brand/Model/Year
    const newFormatRegex = /href="\/videos\/([^\/]+)\/([^\/]+)\/(\d{4})"/gi;
    let match;
    while ((match = newFormatRegex.exec(html)) !== null) {
      const [, , modelSlug, year] = match;
      const modelName = formatModelName(modelSlug.replace(/-/g, " "));
      const key = `${modelName.toLowerCase()}_${year}`;

      if (!seen.has(key)) {
        seen.add(key);
        models.push({
          id: `${year}_${brand.replace(/\s+/g, "_")}_${modelSlug.replace(/-/g, "_")}`,
          name: modelName,
          years: year,
          image: `https://www.carcarekiosk.com/imager/vehicles/${year}_${brand.replace(/\s+/g, "_")}_${modelSlug.replace(/-/g, "_")}/front.jpg`,
          url: `https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${modelSlug}/${year}`,
        });
      }
    }

    // Padrão 2: Formato antigo /video/Year_Brand_Model
    const oldFormatRegex = /href="\/video\/(\d{4})_([^\/]+)(?:\/([^"]+))?"/gi;
    while ((match = oldFormatRegex.exec(html)) !== null) {
      const [, year, modelSlug] = match;
      const modelName = formatModelName(modelSlug);
      const key = `${modelName.toLowerCase()}_${year}`;

      if (!seen.has(key)) {
        seen.add(key);
        models.push({
          id: `${year}_${modelSlug}`,
          name: modelName,
          years: year,
          image: `https://www.carcarekiosk.com/imager/vehicles/${year}_${modelSlug}/front.jpg`,
          url: `https://www.carcarekiosk.com/video/${year}_${modelSlug}`,
        });
      }
    }

    console.log(`Found ${models.length} models for ${brand}`);

    if (models.length === 0) {
      console.log("No models found from scraping, using DB models for", brand);
      const supabase = getSupabaseClient();
      return await getModelsFromDB(supabase, brand);
    }

    return models.sort((a, b) => {
      const yearDiff = parseInt(b.years) - parseInt(a.years);
      if (yearDiff !== 0) return yearDiff;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    const supabase = getSupabaseClient();
    return await getModelsFromDB(supabase, brand);
  }
}

// ============================================================================
// NOVA FUNÇÃO: Buscar página de "todos os vídeos" do modelo
// Esta página contém TODOS os procedimentos disponíveis para um modelo específico
// URL: https://www.carcarekiosk.com/video/{Year}_{Brand}_{Model} ou /videos/{Brand}/{Model}/{Year}
// ============================================================================
interface ModelVideosIndex {
  procedures: Array<{
    category: string;
    categorySlug: string;
    procedure: string;
    procedureSlug: string;
    url: string;
    thumbnail?: string;
  }>;
  vehicleUrl: string;
  totalCount: number;
}

async function fetchAllVideosFromModelPage(
  apiKey: string,
  brand: string,
  model: string,
  year: string
): Promise<ModelVideosIndex | null> {
  try {
    const brandSlug = brand.replace(/\s+/g, "_");
    const modelSlug = model.replace(/\s+/g, "_").replace(/-/g, "_");

    // A página de "todos os vídeos" do modelo - formato mais comum
    // Ex: https://www.carcarekiosk.com/video/2019_Honda_Civic
    // Ou: https://www.carcarekiosk.com/videos/Honda/Civic/2019
    const urlFormats = [
      `https://www.carcarekiosk.com/video/${year}_${brandSlug}_${modelSlug}`,
      `https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${year}`,
      `https://www.carcarekiosk.com/videos/${brand.replace(/\s+/g, "-")}/${model.replace(/\s+/g, "-")}/${year}`,
    ];

    console.log(`[ModelVideosIndex] Fetching all videos index for ${year} ${brand} ${model}...`);

    let html = "";
    let markdown = "";
    let successfulUrl = "";
    const yearStr = year;

    for (const url of urlFormats) {
      try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["html", "markdown"],
            waitFor: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedHtml = data.data?.html || "";
          const fetchedMarkdown = data.data?.markdown || "";

          if (isValidPage(fetchedMarkdown, fetchedHtml) && fetchedHtml.length > 1000) {
            html = fetchedHtml;
            markdown = fetchedMarkdown;
            successfulUrl = url;
            console.log(`[ModelVideosIndex] Successfully fetched from ${url} (${html.length} chars, ${markdown.length} chars markdown)`);
            break;
          }
        }
      } catch (e) {
        console.log(`[ModelVideosIndex] Failed to fetch from ${url}:`, e);
      }
    }

    if (!html) {
      console.log("[ModelVideosIndex] Could not fetch model videos page");
      return null;
    }

    // Função auxiliar para categorizar procedimentos automaticamente
    const categorizeProcedure = (procName: string): string => {
      const p = procName.toLowerCase();

      // Mapeamento de palavras-chave para categorias
      const categoryKeywords: Record<string, string[]> = {
        "oil": ["oil", "motor oil", "oil filter", "oil change", "oil drain"],
        "battery": ["battery", "jump", "starter", "alternator"],
        "air_filter_engine": ["air filter engine", "engine air filter", "engine filter"],
        "air_filter_cabin": ["air filter cabin", "cabin filter", "cabin air"],
        "brakes": ["brake", "pad", "rotor", "caliper"],
        "coolant": ["coolant", "antifreeze", "radiator", "thermostat", "water pump"],
        "headlight": ["headlight", "headlamp", "bulb", "front light"],
        "taillight": ["taillight", "tail light", "brake light", "rear light", "turn signal"],
        "fog_light": ["fog light", "fog lamp"],
        "windshield": ["windshield", "wiper", "washer", "washer fluid"],
        "tire": ["tire", "wheel", "spare", "flat"],
        "fuse": ["fuse", "fuse box", "electrical"],
        "spark_plug": ["spark plug", "ignition", "coil"],
        "transmission": ["transmission", "trans fluid", "atf", "gearbox"],
        "power_steering": ["power steering", "steering fluid", "steering pump"],
        "suspension": ["suspension", "shock", "strut", "spring", "sway bar", "control arm", "ball joint"],
        "exhaust": ["exhaust", "muffler", "catalytic", "oxygen sensor"],
        "fuel": ["fuel", "fuel pump", "fuel filter", "gas"],
        "belt": ["belt", "serpentine", "timing"],
        "engine": ["engine", "motor", "valve", "gasket"],
        "ac": ["air conditioning", "a/c", "ac", "freon", "recharge"],
        "horn": ["horn"],
        "door": ["door", "lock", "window", "handle"],
      };

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
          if (p.includes(keyword)) {
            return category;
          }
        }
      }

      return "maintenance"; // Categoria genérica
    };

    // Extrair TODOS os procedimentos da página usando MÚLTIPLOS padrões
    const procedures: ModelVideosIndex["procedures"] = [];
    const seen = new Set<string>();
    let match;

    // Função auxiliar para adicionar procedimento de forma segura
    const addProcedure = (categorySlug: string, procedureSlug: string, urlPath: string, thumbnail?: string) => {
      const key = `${categorySlug}_${procedureSlug}`.toLowerCase();

      // Filtrar entradas inválidas
      if (!categorySlug || !procedureSlug) return;
      if (categorySlug.length < 2 || procedureSlug.length < 2) return;
      if (categorySlug.includes('svg') || procedureSlug.includes('svg')) return;
      if (categorySlug.includes('img') || procedureSlug.includes('img')) return;
      if (categorySlug.includes('icon') || procedureSlug.includes('icon')) return;

      if (!seen.has(key)) {
        seen.add(key);

        const fullUrl = urlPath.startsWith("http")
          ? urlPath
          : `https://www.carcarekiosk.com${urlPath}`;

        procedures.push({
          category: translateCategoryName(categorySlug.replace(/_/g, " ")),
          categorySlug: categorySlug.toLowerCase().replace(/-/g, "_"),
          procedure: procedureSlug.replace(/_/g, " ").replace(/-/g, " "),
          procedureSlug: procedureSlug.toLowerCase().replace(/-/g, "_"),
          url: fullUrl,
          thumbnail,
        });
      }
    };

    // ============================================================================
    // PADRÕES DE REGEX MELHORADOS PARA CAPTURAR MAIS PROCEDIMENTOS
    // ============================================================================

    // Padrão 1: Links de procedimentos no formato /video/Vehicle/Category/Procedure
    // Ex: /video/2019_Honda_Civic_2.0L_4_Cyl./oil/change
    const procedurePattern1 = /href="((?:https?:\/\/www\.carcarekiosk\.com)?\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"/gi;
    while ((match = procedurePattern1.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 2: Links com atributo data-video ou class específica
    // Ex: <a href="/video/..." class="functions" data-toggle="collapse">
    const procedurePattern2 = /<a[^>]*href="([^"]*\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"[^>]*(?:class="[^"]*functions[^"]*"|data-toggle)[^>]*>/gi;
    while ((match = procedurePattern2.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 3: Links dentro de listas de procedimentos
    // Ex: <li><a href="/video/.../category/procedure">Procedure Name</a></li>
    const procedurePattern3 = /<li[^>]*>\s*<a[^>]*href="([^"]*\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"[^>]*>[^<]+<\/a>/gi;
    while ((match = procedurePattern3.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 4: Cards de categoria com imagens e links
    // Ex: <div class="card">...<a href="/video/...">...</a>...</div>
    const cardPattern = /<div[^>]*class="[^"]*card[^"]*"[^>]*>[\s\S]*?href="([^"]*\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"[\s\S]*?<\/div>/gi;
    while ((match = cardPattern.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 5: Extrair do markdown - formato de lista
    // Ex: - [Oil Change](/video/...)
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]*\/video\/[^)]+\/([^)\/]+)\/([^)\/]+))\)/gi;
    while ((match = markdownLinkPattern.exec(markdown)) !== null) {
      const [, , urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 6: Links com texto de procedimento
    // Ex: <a href="...">Oil Change</a>
    const procedureWithTextPattern = /<a[^>]*href="([^"]*\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"[^>]*>([^<]+)<\/a>/gi;
    while ((match = procedureWithTextPattern.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 7: URLs absolutas no HTML
    // Ex: https://www.carcarekiosk.com/video/2019_Honda_Civic/oil/change
    const absoluteUrlPattern = /(https:\/\/www\.carcarekiosk\.com\/video\/[^\s"'<>]+\/([a-z_-]+)\/([a-z_-]+))/gi;
    while ((match = absoluteUrlPattern.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 8: Botões de procedimentos
    // Ex: <button onclick="location.href='/video/...'">
    const buttonPattern = /onclick="[^"]*location\.href='([^']*\/video\/[^']+\/([^'\/]+)\/([^'\/]+))'"/gi;
    while ((match = buttonPattern.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 9: Links em atributos data-*
    // Ex: data-href="/video/..." ou data-url="..."
    const dataAttrPattern = /data-(?:href|url)="([^"]*\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"/gi;
    while ((match = dataAttrPattern.exec(html)) !== null) {
      const [, urlPath, categorySlug, procedureSlug] = match;
      addProcedure(categorySlug, procedureSlug, urlPath);
    }

    // Padrão 10: Extrair categorias de collapse panels
    // O site CarCareKiosk usa painéis colapsáveis para cada categoria
    const collapsePattern = /<a[^>]*data-toggle="collapse"[^>]*href="#collapse-([^"]+)"[^>]*>[^<]*<\/a>[\s\S]*?<div[^>]*id="collapse-\1"[^>]*>([\s\S]*?)<\/div>/gi;
    while ((match = collapsePattern.exec(html)) !== null) {
      const [, categoryId, innerContent] = match;

      // Dentro do painel, buscar todos os procedimentos
      const innerProcPattern = /href="([^"]*\/video\/[^"]+\/[^"\/]+\/([^"\/]+))"/gi;
      let innerMatch;
      while ((innerMatch = innerProcPattern.exec(innerContent)) !== null) {
        const [, urlPath, procedureSlug] = innerMatch;
        addProcedure(categoryId, procedureSlug, urlPath);
      }
    }

    // ============================================================================
    // EXTRAIR THUMBNAILS E ASSOCIAR COM PROCEDIMENTOS
    // ============================================================================

    // Padrão de thumbnails do CloudFront
    const thumbnailPattern = /https:\/\/d2n97g4vasjwsk\.cloudfront\.net\/[^"'\s\)]+\.(?:webp|jpg|png)/gi;
    const thumbnails: string[] = [];
    while ((match = thumbnailPattern.exec(html)) !== null) {
      thumbnails.push(match[0]);
    }

    // Também extrair do markdown
    while ((match = thumbnailPattern.exec(markdown)) !== null) {
      if (!thumbnails.includes(match[0])) {
        thumbnails.push(match[0]);
      }
    }

    // Extrair procedimentos das thumbnails (quando não encontramos via links)
    // Ex: https://d2n97g4vasjwsk.cloudfront.net/2019_Honda_Civic/Oil+Change+-+480p.webp
    for (const thumb of thumbnails) {
      // Decodificar URL e extrair nome do procedimento
      const decodedThumb = decodeURIComponent(thumb.replace(/\+/g, " "));

      // Formato: /Vehicle/ProcedureName - Resolution.webp
      const thumbProcMatch = decodedThumb.match(/cloudfront\.net\/[^\/]+\/([^\/\-]+)/i);
      if (thumbProcMatch) {
        const procedureName = thumbProcMatch[1].trim().toLowerCase().replace(/\s+/g, "_");

        // Se esse procedimento ainda não foi encontrado, adicionar como procedimento genérico
        const hasThisProc = procedures.some(p =>
          p.procedureSlug.toLowerCase().includes(procedureName) ||
          procedureName.includes(p.procedureSlug.toLowerCase())
        );

        if (!hasThisProc && procedureName.length > 3) {
          // Categorizar automaticamente baseado no nome
          const category = categorizeProcedure(procedureName);
          addProcedure(category, procedureName, `/video/${yearStr}_${brandSlug}_${modelSlug}/${category}/${procedureName}`, thumb);
        }
      }

      // Associar thumbnails com procedimentos existentes
      for (const proc of procedures) {
        const procName = proc.procedureSlug.replace(/_/g, " ").toLowerCase();
        const thumbLower = decodedThumb.toLowerCase();

        if (thumbLower.includes(procName) || procName.includes(thumbLower.split("/").pop()?.split("-")[0]?.trim() || "")) {
          if (!proc.thumbnail) {
            proc.thumbnail = thumb;
          }
        }
      }
    }

    console.log(`[ModelVideosIndex] Found ${procedures.length} procedures from model page using enhanced patterns`);

    return {
      procedures,
      vehicleUrl: successfulUrl,
      totalCount: procedures.length,
    };
  } catch (error) {
    console.error("[ModelVideosIndex] Error:", error);
    return null;
  }
}

// ============================================================================
// NOVA FUNÇÃO: Escanear e salvar procedimentos no cache do banco de dados
// COM FALLBACK: Usa dados estáticos quando Firecrawl não conseguir acessar o site
// ============================================================================
async function scanAndCacheProcedures(
  apiKey: string,
  brand: string,
  model: string,
  year: string
): Promise<{ proceduresFound: number; categoriesFound: number; cached: number; usedFallback: boolean }> {
  console.log(`[ScanAndCache] Starting scan for ${year} ${brand} ${model}...`);

  // Buscar todos os vídeos da página do modelo
  const modelVideosIndex = await fetchAllVideosFromModelPage(apiKey, brand, model, year);

  // Se não encontrou procedimentos via Firecrawl, usar dados estáticos como fallback
  if (!modelVideosIndex || modelVideosIndex.totalCount === 0) {
    console.log("[ScanAndCache] Firecrawl failed, using static data fallback...");
    return await cacheStaticProcedures(brand, model, year);
  }

  const supabase = getSupabaseClient();
  const categories = new Set<string>();
  let cached = 0;

  // Preparar dados para upsert
  const proceduresToCache = modelVideosIndex.procedures.map(proc => {
    categories.add(proc.categorySlug);

    return {
      brand: brand,
      model: model,
      year: year,
      procedure_id: proc.procedureSlug,
      procedure_name: proc.procedure,
      procedure_name_pt: translateCategoryName(proc.procedure),
      category: proc.categorySlug,
      video_url: proc.url,
      thumbnail_url: proc.thumbnail || null,
      source_url: modelVideosIndex.vehicleUrl,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    };
  });

  // Upsert em lotes de 50
  const batchSize = 50;
  for (let i = 0; i < proceduresToCache.length; i += batchSize) {
    const batch = proceduresToCache.slice(i, i + batchSize);

    const { error } = await supabase
      .from("carcare_procedure_cache")
      .upsert(batch, {
        onConflict: "brand,model,year,procedure_id",
        ignoreDuplicates: false
      });

    if (error) {
      console.error("[ScanAndCache] Error caching batch:", error);
    } else {
      cached += batch.length;
    }
  }

  console.log(`[ScanAndCache] Cached ${cached} procedures in ${categories.size} categories`);

  return {
    proceduresFound: modelVideosIndex.totalCount,
    categoriesFound: categories.size,
    cached,
    usedFallback: false,
  };
}

// Fallback: Cache procedimentos baseados em dados estáticos
async function cacheStaticProcedures(
  brand: string,
  model: string,
  year: string
): Promise<{ proceduresFound: number; categoriesFound: number; cached: number; usedFallback: boolean }> {
  const supabase = getSupabaseClient();

  // Obter categorias do DB
  const staticCategories = await getCategoriesWithProceduresFromDB(supabase);

  const procedureMap = new Map<string, {
    brand: string;
    model: string;
    year: string;
    procedure_id: string;
    procedure_name: string;
    procedure_name_pt: string;
    category: string;
    video_url: string;
    thumbnail_url: string | null;
    source_url: string;
    expires_at: string;
  }>();

  const categoriesSet = new Set<string>();
  const brandSlug = brand.replace(/\s+/g, "_");
  const modelSlug = model.replace(/\s+/g, "_").replace(/-/g, "_");
  const vehicleSlug = `${year}_${brandSlug}_${modelSlug}`;

  for (const cat of staticCategories) {
    categoriesSet.add(cat.id);

    for (const proc of cat.procedures) {
      // Use unique key to avoid duplicates
      const uniqueKey = `${proc.id}_${cat.id}`;

      if (!procedureMap.has(uniqueKey)) {
        procedureMap.set(uniqueKey, {
          brand,
          model,
          year,
          procedure_id: `${cat.id}_${proc.id}`, // Make procedure_id unique per category
          procedure_name: proc.nameEn,
          procedure_name_pt: proc.name,
          category: cat.id,
          video_url: `https://www.carcarekiosk.com/video/${vehicleSlug}/${cat.id}/${proc.id}`,
          thumbnail_url: null,
          source_url: `https://www.carcarekiosk.com/video/${vehicleSlug}`,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }

  const allProcedures = Array.from(procedureMap.values());

  let cached = 0;
  const batchSize = 50;

  for (let i = 0; i < allProcedures.length; i += batchSize) {
    const batch = allProcedures.slice(i, i + batchSize);

    const { error } = await supabase
      .from("carcare_procedure_cache")
      .upsert(batch, {
        onConflict: "brand,model,year,procedure_id",
        ignoreDuplicates: false
      });

    if (error) {
      console.error("[StaticFallback] Error caching batch:", error);
    } else {
      cached += batch.length;
    }
  }

  console.log(`[StaticFallback] Cached ${cached} static procedures for ${brand} ${model} ${year}`);

  return {
    proceduresFound: allProcedures.length,
    categoriesFound: categoriesSet.size,
    cached,
    usedFallback: true,
  };
}

// Converter o índice de vídeos do modelo para o formato de categorias
function convertVideosIndexToCategories(
  index: ModelVideosIndex,
  brand: string,
  model: string,
  year: string
): any[] {
  const categoryMap = new Map<string, {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    url: string;
    vehicleContext: string;
    procedures: any[];
  }>();

  const vehicleContext = `${brand} ${model} ${year}`;

  for (const proc of index.procedures) {
    const catKey = proc.categorySlug.toLowerCase();

    if (!categoryMap.has(catKey)) {
      categoryMap.set(catKey, {
        id: proc.categorySlug.toLowerCase().replace(/_/g, "-"),
        name: translateCategoryName(proc.category),
        nameEn: proc.category,
        icon: getCategoryIcon(proc.category),
        url: index.vehicleUrl,
        vehicleContext,
        procedures: [],
      });
    }

    const cat = categoryMap.get(catKey)!;

    // Evitar procedimentos duplicados
    if (!cat.procedures.some(p => p.id === proc.procedureSlug)) {
      cat.procedures.push({
        id: proc.procedureSlug,
        name: translateCategoryName(proc.procedure),
        nameEn: proc.procedure,
        url: proc.url,
        thumbnail: proc.thumbnail,
      });
    }
  }

  // Converter para array e ordenar
  const categories = Array.from(categoryMap.values());
  categories.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`[ConvertIndex] Created ${categories.length} categories from ${index.totalCount} procedures`);

  return categories;
}

// Buscar vídeos de um modelo específico - SUPORTA AMBOS FORMATOS DE URL
// MELHORADO: Agora também busca a página de "todos os vídeos" do modelo
async function fetchVideosFromCarCareKiosk(
  apiKey: string,
  brand: string,
  model: string,
  year?: string
): Promise<any[]> {
  try {
    const brandSlug = brand.replace(/\s+/g, "_");
    const modelSlug = model.replace(/\s+/g, "_").replace(/-/g, "_");
    const yearStr = year || new Date().getFullYear().toString();

    // NOVO: Primeiro, buscar a página de "todos os vídeos" do modelo
    // Isso nos dá uma visão completa de todos os procedimentos disponíveis
    const modelVideosIndex = await fetchAllVideosFromModelPage(apiKey, brand, model, yearStr);

    if (modelVideosIndex && modelVideosIndex.totalCount > 0) {
      console.log(`[Videos] Using model videos index with ${modelVideosIndex.totalCount} procedures`);

      // Converter o índice de vídeos para o formato de categorias
      return convertVideosIndexToCategories(modelVideosIndex, brand, model, yearStr);
    }

    console.log("[Videos] Model videos index empty or failed, falling back to category scraping...");

    // Fallback: Tentar múltiplos formatos de URL
    const urlFormats = [
      // Novo formato: /videos/Brand/Model/Year
      `https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${yearStr}`,
      // Formato alternativo com slugs
      `https://www.carcarekiosk.com/videos/${brand.replace(/\s+/g, "-")}/${model.replace(/\s+/g, "-")}/${yearStr}`,
      // Formato antigo: /video/Year_Brand_Model
      `https://www.carcarekiosk.com/video/${yearStr}_${brandSlug}_${modelSlug}`,
    ];

    let html = "";
    let markdown = "";
    let successfulUrl = "";

    for (const url of urlFormats) {
      console.log(`Trying to fetch videos from ${url}...`);

      try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["html", "markdown"],
            waitFor: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedHtml = data.data?.html || "";
          const fetchedMarkdown = data.data?.markdown || "";

          if (isValidPage(fetchedMarkdown, fetchedHtml) && fetchedHtml.length > 500) {
            html = fetchedHtml;
            markdown = fetchedMarkdown;
            successfulUrl = url;
            console.log(`Successfully fetched from ${url} (${html.length} chars)`);
            break;
          } else {
            console.log(`Page from ${url} appears invalid, trying next format...`);
          }
        }
      } catch (e) {
        console.log(`Failed to fetch from ${url}:`, e);
      }
    }

    if (!html) {
      console.log(`All URL formats failed for ${brand} ${model} ${yearStr}, using DB categories`);
      const supabase = getSupabaseClient();
      return await getCategoriesWithProceduresFromDB(supabase);
    }

    const categories: any[] = [];
    const seen = new Set();
    const proceduresSeen = new Set();

    // O CarCareKiosk usa um layout de cards onde cada card é uma categoria com procedimentos
    // Estrutura: <div class="card">...<a href="#collapse-categoryname">Category Name</a>...<li><a href="/video/...">Procedure</a></li>...</div>

    // Padrão 1: Extrair categorias dos cards (collapse headers)
    const categoryHeaderRegex = /<a[^>]*data-toggle="collapse"[^>]*href="[^"]*#collapse-([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    const categoryMap = new Map<string, { id: string; name: string; thumbnail: string; procedures: any[] }>();

    while ((match = categoryHeaderRegex.exec(html)) !== null) {
      const [, categoryId, categoryName] = match;
      const cleanName = categoryName.trim();

      if (cleanName && !categoryMap.has(categoryId.toLowerCase())) {
        categoryMap.set(categoryId.toLowerCase(), {
          id: categoryId,
          name: cleanName,
          thumbnail: "",
          procedures: [],
        });
      }
    }

    // Padrão 2: Extrair thumbnails das categorias
    const thumbnailRegex = /<img[^>]*src="([^"]+)"[^>]*alt="[^"]*([^"]+)"[^>]*class="card-img-top"/gi;
    while ((match = thumbnailRegex.exec(html)) !== null) {
      const [, imgUrl, altText] = match;
      // Tentar encontrar qual categoria corresponde
      for (const [catId, catData] of categoryMap.entries()) {
        if (altText.toLowerCase().includes(catData.name.toLowerCase().split(' ')[0])) {
          catData.thumbnail = imgUrl;
          break;
        }
      }
    }

    // Padrão 3: Extrair procedimentos (links para vídeos específicos)
    // Links no formato: /video/2019_Honda_Civic_Type_R_2.0L_4_Cyl._Turbo/category/procedure
    const procedureRegex = /<a[^>]*href="(https?:\/\/www\.carcarekiosk\.com\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"[^>]*class="[^"]*functions[^"]*"[^>]*>([^<]+)<\/a>/gi;

    while ((match = procedureRegex.exec(html)) !== null) {
      const [, fullUrl, categorySlug, procedureSlug, procedureName] = match;
      const cleanProcedureName = procedureName.trim();
      const procKey = `${categorySlug}_${procedureSlug}`;

      if (!proceduresSeen.has(procKey)) {
        proceduresSeen.add(procKey);

        // Encontrar ou criar a categoria
        const categoryId = categorySlug.toLowerCase().replace(/_/g, '');
        let category = categoryMap.get(categoryId);

        if (!category) {
          // Criar categoria se não existir
          category = {
            id: categorySlug,
            name: translateCategoryName(categorySlug.replace(/_/g, ' ')),
            thumbnail: "",
            procedures: [],
          };
          categoryMap.set(categoryId, category);
        }

        category.procedures.push({
          id: procedureSlug,
          name: translateCategoryName(cleanProcedureName),
          nameEn: cleanProcedureName,
          url: fullUrl,
        });
      }
    }

    // Padrão alternativo: href sem protocolo
    const procedureRegex2 = /href="(\/video\/[^"]+\/([^"\/]+)\/([^"\/]+))"[^>]*>([^<]+)<\/a>/gi;

    while ((match = procedureRegex2.exec(html)) !== null) {
      const [, path, categorySlug, procedureSlug, procedureName] = match;
      const cleanProcedureName = procedureName.trim();
      const procKey = `${categorySlug}_${procedureSlug}`;

      // Ignorar links que não são procedimentos válidos
      if (procedureName.includes('svg') || procedureName.includes('img') || procedureName.length < 3) {
        continue;
      }

      if (!proceduresSeen.has(procKey)) {
        proceduresSeen.add(procKey);

        const categoryId = categorySlug.toLowerCase().replace(/_/g, '');
        let category = categoryMap.get(categoryId);

        if (!category) {
          category = {
            id: categorySlug,
            name: translateCategoryName(categorySlug.replace(/_/g, ' ')),
            thumbnail: "",
            procedures: [],
          };
          categoryMap.set(categoryId, category);
        }

        category.procedures.push({
          id: procedureSlug,
          name: translateCategoryName(cleanProcedureName),
          nameEn: cleanProcedureName,
          url: `https://www.carcarekiosk.com${path}`,
        });
      }
    }

    // Converter mapa para array de categorias
    for (const [, catData] of categoryMap) {
      if (catData.procedures.length > 0 && !seen.has(catData.name.toLowerCase())) {
        seen.add(catData.name.toLowerCase());
        categories.push({
          id: catData.id.toLowerCase().replace(/_/g, '-'),
          name: translateCategoryName(catData.name),
          nameEn: catData.name,
          icon: getCategoryIcon(catData.name),
          thumbnail: catData.thumbnail || undefined,
          url: successfulUrl,
          vehicleContext: `${brand} ${model} ${yearStr}`,
          procedures: catData.procedures,
        });
      }
    }

    // Ordenar categorias por nome
    categories.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${categories.length} video categories with ${proceduresSeen.size} procedures for ${brand} ${model}`);

    if (categories.length === 0) {
      console.log(`No categories found for ${brand} ${model}, using DB categories`);
      const supabase = getSupabaseClient();
      return await getCategoriesWithProceduresFromDB(supabase);
    }

    return categories;
  } catch (error) {
    console.error("Error fetching videos:", error);
    const supabase = getSupabaseClient();
    return await getCategoriesWithProceduresFromDB(supabase);
  }
}

// function translateCategoryName removed (imported from static_data.ts)


// Gerar todas as variantes de URL possíveis do CarCareKiosk (suporta AMBOS formatos)
function generateUrlVariants(videoUrl: string, brand?: string, model?: string, year?: string): string[] {
  const urls: string[] = [];

  // Normalizar a URL de entrada
  let baseUrl = videoUrl.trim();

  // Se é uma URL completa, usar diretamente
  if (baseUrl.startsWith('http')) {
    urls.push(baseUrl);

    // Converter entre formatos se possível
    // Formato antigo: /video/2012_Honda_Civic/category/procedure
    // Formato novo:   /videos/Honda/Civic/2012/category/procedure

    const oldFormatMatch = baseUrl.match(/\/video\/(\d{4})_([^\/]+)_([^\/]+)(\/.*)?$/);
    if (oldFormatMatch) {
      const [, urlYear, urlBrand, urlModel, rest] = oldFormatMatch;
      const newUrl = `https://www.carcarekiosk.com/videos/${urlBrand.replace(/_/g, "-")}/${urlModel.replace(/_/g, "-")}/${urlYear}${rest || ""}`;
      urls.push(newUrl);
    }

    const newFormatMatch = baseUrl.match(/\/videos\/([^\/]+)\/([^\/]+)\/(\d{4})(\/.*)?$/);
    if (newFormatMatch) {
      const [, urlBrand, urlModel, urlYear, rest] = newFormatMatch;
      const oldUrl = `https://www.carcarekiosk.com/video/${urlYear}_${urlBrand.replace(/-/g, "_")}_${urlModel.replace(/-/g, "_")}${rest || ""}`;
      urls.push(oldUrl);
    }
  } else if (baseUrl.startsWith('/')) {
    // Se começa com /, adicionar domínio e tentar ambos formatos
    urls.push(`https://www.carcarekiosk.com${baseUrl}`);

    // Converter para o outro formato
    if (baseUrl.startsWith('/video/')) {
      const match = baseUrl.match(/^\/video\/(\d{4})_([^\/]+)_([^\/]+)(\/.*)?$/);
      if (match) {
        const [, urlYear, urlBrand, urlModel, rest] = match;
        urls.push(`https://www.carcarekiosk.com/videos/${urlBrand.replace(/_/g, "-")}/${urlModel.replace(/_/g, "-")}/${urlYear}${rest || ""}`);
      }
    } else if (baseUrl.startsWith('/videos/')) {
      const match = baseUrl.match(/^\/videos\/([^\/]+)\/([^\/]+)\/(\d{4})(\/.*)?$/);
      if (match) {
        const [, urlBrand, urlModel, urlYear, rest] = match;
        urls.push(`https://www.carcarekiosk.com/video/${urlYear}_${urlBrand.replace(/-/g, "_")}_${urlModel.replace(/-/g, "_")}${rest || ""}`);
      }
    }
  } else {
    // É um slug ou categoria/procedimento - construir URLs a partir do contexto do veículo
    if (brand && model && year) {
      const brandSlugUnderscore = brand.replace(/\s+/g, "_");
      const brandSlugDash = brand.replace(/\s+/g, "-");
      const modelSlugUnderscore = model.replace(/\s+/g, "_").replace(/-/g, "_");
      const modelSlugDash = model.replace(/\s+/g, "-");

      // Determinar se é categoria/procedimento ou apenas procedimento
      const parts = baseUrl.split('/').filter(Boolean);

      if (parts.length >= 2) {
        // Tem categoria e procedimento: category/procedure
        const category = parts[0];
        const procedure = parts.slice(1).join('/');

        // Novo formato: /videos/Brand/Model/Year/category/procedure
        urls.push(`https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${year}/${category}/${procedure}`);
        urls.push(`https://www.carcarekiosk.com/videos/${brandSlugDash}/${modelSlugDash}/${year}/${category}/${procedure}`);

        // Formato antigo: /video/Year_Brand_Model/category/procedure
        urls.push(`https://www.carcarekiosk.com/video/${year}_${brandSlugUnderscore}_${modelSlugUnderscore}/${category}/${procedure}`);
      } else if (parts.length === 1) {
        // Só tem categoria ou procedimento
        const slug = parts[0].replace(/\s+/g, "_").toLowerCase();

        // Tentar como categoria (página de listagem)
        urls.push(`https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${year}/${slug}`);
        urls.push(`https://www.carcarekiosk.com/video/${year}_${brandSlugUnderscore}_${modelSlugUnderscore}/${slug}`);

        // Tentar categorias comuns com esse procedimento
        const commonCategories = ['maintenance', 'air_filter', 'engine', 'brakes', 'battery', 'coolant', 'oil', 'lights'];
        for (const cat of commonCategories) {
          urls.push(`https://www.carcarekiosk.com/video/${year}_${brandSlugUnderscore}_${modelSlugUnderscore}/${cat}/${slug}`);
        }
      }
    }

    // Fallback: tentar diretamente
    if (!baseUrl.startsWith('http')) {
      urls.push(`https://www.carcarekiosk.com/video/${baseUrl}`);
      urls.push(`https://www.carcarekiosk.com/videos/${baseUrl}`);
    }
  }

  // Se temos contexto do veículo, adicionar mais variantes
  if (brand && model && year) {
    const brandSlugUnderscore = brand.replace(/\s+/g, "_");
    const brandSlugDash = brand.replace(/\s+/g, "-");
    const modelSlugUnderscore = model.replace(/\s+/g, "_").replace(/-/g, "_");
    const modelSlugDash = model.replace(/\s+/g, "-");

    // Página principal do veículo (ambos formatos)
    urls.push(`https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${year}`);
    urls.push(`https://www.carcarekiosk.com/videos/${brandSlugDash}/${modelSlugDash}/${year}`);
    urls.push(`https://www.carcarekiosk.com/video/${year}_${brandSlugUnderscore}_${modelSlugUnderscore}`);

    // Extrair categoria/procedimento da URL original se existir
    const pathMatch = baseUrl.match(/\/([^\/]+)\/([^\/]+)$/);
    if (pathMatch) {
      const [, category, procedure] = pathMatch;

      // Novo formato
      urls.push(`https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${year}/${category}/${procedure}`);

      // Formato antigo
      urls.push(`https://www.carcarekiosk.com/video/${year}_${brandSlugUnderscore}_${modelSlugUnderscore}/${category}/${procedure}`);
    }
  }

  // Remover duplicatas e URLs inválidas
  const validUrls = urls.filter(url => url && url.includes('carcarekiosk.com') && url.startsWith('http'));
  return [...new Set(validUrls)];
}

// Verificar se uma página é válida (não é NOT FOUND nem erro 500)
function isValidPage(markdown: string, html: string): boolean {
  const invalidIndicators = [
    'NOT FOUND',
    'not found',
    'page was not found',
    '404',
    'Error 404',
    'Page Not Found',
    'HTTP ERROR 500',
    'HTTP ERROR 503',
    'is currently unable to handle this request',
    'This page isn\'t working',
    'Internal Server Error',
    'Service Unavailable',
  ];

  const contentLower = (markdown + html).toLowerCase();

  for (const indicator of invalidIndicators) {
    if (contentLower.includes(indicator.toLowerCase())) {
      console.log(`Invalid page detected - indicator found: "${indicator}"`);
      return false;
    }
  }

  // Verificar se tem conteúdo mínimo (páginas válidas têm mais de 500 caracteres)
  if (markdown.length < 200 && html.length < 500) {
    console.log("Invalid page detected - content too short");
    return false;
  }

  return true;
}

// Buscar detalhes de um vídeo específico com fallback de URLs
async function fetchVideoDetails(apiKey: string, videoUrl: string, vehicleContext?: string, skipCache?: boolean): Promise<any> {
  try {
    // Parse vehicle context para extrair brand/model/year
    let brand: string | undefined;
    let model: string | undefined;
    let year: string | undefined;

    if (vehicleContext) {
      const parts = vehicleContext.split(' ').filter(Boolean);
      if (parts.length >= 3) {
        brand = parts[0];
        model = parts.slice(1, -1).join(' ');
        year = parts[parts.length - 1];
      } else if (parts.length === 2) {
        brand = parts[0];
        model = parts[1];
      }
    }

    // ESTRATÉGIA: Se recebemos apenas um procedimento simples (sem URL completa),
    // devemos buscar a página base do veículo que contém TODOS os thumbnails de vídeos
    // e de lá extrair os vídeos relevantes para o procedimento solicitado
    const isSimpleProcedure = !videoUrl.startsWith('http') && !videoUrl.startsWith('/') && !videoUrl.includes('/');

    // Se é um procedimento simples e temos contexto do veículo, buscar página base primeiro
    let vehiclePageUrl: string | undefined;
    if (isSimpleProcedure && brand && model && year) {
      const brandSlugDash = brand.replace(/\s+/g, '-');
      const modelSlugDash = model.replace(/\s+/g, '-');
      vehiclePageUrl = `https://www.carcarekiosk.com/videos/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${year}`;
      console.log(`Simple procedure detected: "${videoUrl}". Will search in vehicle page: ${vehiclePageUrl}`);
    }

    const urlVariants = generateUrlVariants(videoUrl, brand, model, year);

    // Se temos a página base do veículo, colocá-la como primeira opção
    if (vehiclePageUrl && !urlVariants.includes(vehiclePageUrl)) {
      urlVariants.unshift(vehiclePageUrl);
    }

    const primaryUrl = urlVariants[0];

    console.log(`Fetching video details from ${primaryUrl}... (skipCache: ${skipCache})`);
    console.log(`URL variants to try: ${urlVariants.length}`);

    // ========== VERIFICAR CACHE PRIMEIRO (se não skipCache) ==========
    if (!skipCache) {
      const cached = await getCachedTranscription(primaryUrl);
      if (cached) {
        console.log("Returning cached transcription data");
        return {
          title: cached.translated_title || "Tutorial",
          description: cached.translated_description || "",
          videoDescription: cached.translated_video_description || undefined,
          videoUrl: cached.youtube_video_id ? `https://www.youtube.com/embed/${cached.youtube_video_id}` : null,
          sourceUrl: primaryUrl,
          steps: cached.elaborated_steps || [],
          transcriptionUsed: cached.transcription_used,
          fromCache: true,
          cacheExpiresAt: cached.expires_at,
        };
      }
    } else {
      console.log("Skipping cache, forcing reprocessing...");
    }

    // Tentar cada variante de URL até encontrar uma válida
    let validData: { html: string; markdown: string; metadata: any } | null = null;
    let successfulUrl = primaryUrl;

    for (const urlToTry of urlVariants) {
      console.log(`Trying URL: ${urlToTry}`);

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: urlToTry,
          formats: ["html", "markdown"],
          waitFor: 3000,
        }),
      });

      if (!response.ok) {
        console.log(`HTTP error for ${urlToTry}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const html = data.data?.html || "";
      const markdown = data.data?.markdown || "";
      const metadata = data.data?.metadata || {};

      // Verificar se a página é válida
      if (isValidPage(markdown, html)) {
        validData = { html, markdown, metadata };
        successfulUrl = urlToTry;
        console.log(`Found valid page at: ${urlToTry}`);
        break;
      } else {
        console.log(`Page not found at: ${urlToTry}`);
      }
    }

    // Se nenhuma URL funcionou, usar fallback com dados estáticos
    if (!validData) {
      console.log("All URL variants failed, using static fallback data");

      // Extrair categoria/procedimento da URL para gerar passos estáticos
      const procedureSlug = videoUrl.split('/').pop() || "";
      const categorySlug = videoUrl.split('/').slice(-2, -1)[0] || "";

      const fallbackSteps = generateStaticFallbackSteps(procedureSlug, categorySlug, vehicleContext);

      return {
        title: formatProcedureTitle(procedureSlug),
        description: `Tutorial de manutenção para ${vehicleContext || "seu veículo"}.`,
        videoUrl: null,
        sourceUrl: primaryUrl,
        steps: fallbackSteps,
        transcriptionUsed: false,
        fromCache: false,
        isStaticFallback: true,
        errorMessage: "Conteúdo gerado automaticamente. Para o tutorial completo, visite o CarCareKiosk."
      };
    }

    const { html, markdown, metadata } = validData;

    console.log(`Processing page content: ${html.length} chars HTML, ${markdown.length} chars Markdown`);

    // ========== EXTRAIR VÍDEO ==========
    // O CarCareKiosk usa vídeos MP4 hospedados no CloudFront (não YouTube!)
    // Múltiplos padrões são tentados para maior robustez

    let videoEmbedUrl: string | null = null;
    let videoSource: "cloudfront" | "youtube" | null = null;
    let youtubeVideoId: string | null = null;

    // Log para debug - verificar se há padrões de vídeo no HTML
    const hasVideoTag = html.includes('<video');
    const hasSourceTag = html.includes('<source');
    const hasCloudfront = html.includes('cloudfront.net');
    const hasYoutube = html.includes('youtube.com') || html.includes('youtu.be');
    console.log(`Video detection hints: video=${hasVideoTag}, source=${hasSourceTag}, cloudfront=${hasCloudfront}, youtube=${hasYoutube}`);

    // Prioridade 1: Vídeo MP4 do CloudFront - MÚLTIPLOS PADRÕES
    // Padrão principal: <source src="https://d2n97g4vasjwsk.cloudfront.net/...mp4" type="video/mp4">
    const cloudfrontPatterns = [
      // Padrão completo com tipo
      /<source[^>]*src="(https:\/\/[^"]*cloudfront\.net[^"]*\.mp4)"[^>]*type="video\/mp4"/gi,
      // Padrão sem tipo mas com cloudfront
      /<source[^>]*src="(https:\/\/[^"]*cloudfront\.net[^"]*\.mp4)"/gi,
      // Tag video com src direto
      /<video[^>]*src="(https:\/\/[^"]*cloudfront\.net[^"]*\.mp4)"/gi,
      // Qualquer URL cloudfront .mp4 no HTML
      /src="(https:\/\/d2n97g4vasjwsk\.cloudfront\.net\/[^"]+\.mp4)"/gi,
      // Padrão mais genérico - qualquer cloudfront mp4
      /(https:\/\/[a-z0-9]+\.cloudfront\.net\/[^\s"'<>]+\.mp4)/gi,
    ];

    for (const pattern of cloudfrontPatterns) {
      const match = pattern.exec(html);
      if (match && match[1]) {
        videoEmbedUrl = match[1];
        videoSource = "cloudfront";
        console.log(`Found CloudFront video (pattern ${cloudfrontPatterns.indexOf(pattern)}):`, videoEmbedUrl);
        break;
      }
    }

    // Prioridade 2: Qualquer vídeo MP4 (outros CDNs)
    if (!videoEmbedUrl) {
      const anyMp4Patterns = [
        /<source[^>]*src="(https?:\/\/[^"]+\.mp4)"[^>]*type="video\/mp4"/gi,
        /<source[^>]*src="(https?:\/\/[^"]+\.mp4)"/gi,
        /<video[^>]*src="(https?:\/\/[^"]+\.mp4)"/gi,
      ];

      for (const pattern of anyMp4Patterns) {
        const match = pattern.exec(html);
        if (match && match[1]) {
          videoEmbedUrl = match[1];
          videoSource = "cloudfront"; // Tratamos como cloudfront para simplificar
          console.log(`Found MP4 video (generic pattern):`, videoEmbedUrl);
          break;
        }
      }
    }

    // Prioridade 3: Fallback para YouTube (caso o CarCareKiosk mude de estratégia)
    if (!videoEmbedUrl) {
      const youtubePatterns = [
        /src="(https:\/\/www\.youtube\.com\/embed\/([^"?]+))"/i,
        /src="(https:\/\/youtube\.com\/embed\/([^"?]+))"/i,
        /<iframe[^>]*src="[^"]*youtube\.com\/embed\/([^"?]+)"/i,
      ];

      for (const pattern of youtubePatterns) {
        const match = pattern.exec(html);
        if (match) {
          if (match[2]) {
            youtubeVideoId = match[2];
            videoEmbedUrl = match[1];
          } else if (match[1] && match[1].length === 11) {
            youtubeVideoId = match[1];
            videoEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;
          }
          if (youtubeVideoId) {
            videoSource = "youtube";
            console.log("Found YouTube video:", videoEmbedUrl);
            break;
          }
        }
      }
    }

    // Prioridade 4: YouTube no markdown
    if (!videoEmbedUrl) {
      const youtubeMatch = markdown.match(/youtube\.com\/(?:watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) {
        youtubeVideoId = youtubeMatch[1];
        videoEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;
        videoSource = "youtube";
        console.log("Found YouTube in markdown:", videoEmbedUrl);
      }
    }

    // Prioridade 5: Extrair da estrutura específica do CarCareKiosk
    // O site pode ter um player customizado ou estrutura diferente
    if (!videoEmbedUrl) {
      // Procurar por data-video-src ou atributos data-* com URLs de vídeo
      const dataVideoMatch = html.match(/data-(?:video-)?src="(https?:\/\/[^"]+\.(?:mp4|webm))"/i);
      if (dataVideoMatch) {
        videoEmbedUrl = dataVideoMatch[1];
        videoSource = "cloudfront";
        console.log("Found video in data attribute:", videoEmbedUrl);
      }
    }

    // Prioridade 6: Procurar por URLs em scripts (player dinâmico)
    if (!videoEmbedUrl) {
      const scriptVideoMatch = html.match(/['"]?(https:\/\/[^'"]*cloudfront\.net[^'"]*\.mp4)['"]?/i);
      if (scriptVideoMatch) {
        videoEmbedUrl = scriptVideoMatch[1];
        videoSource = "cloudfront";
        console.log("Found video URL in script:", videoEmbedUrl);
      }
    }

    // Prioridade 7: Construir URL do vídeo a partir das thumbnails do CloudFront
    // As thumbnails do CarCareKiosk seguem o padrão:
    // https://d2n97g4vasjwsk.cloudfront.net/VEHICLE/PROCEDURE - 480p.webp
    // Os vídeos seguem: https://d2n97g4vasjwsk.cloudfront.net/VEHICLE/PROCEDURE.mp4
    if (!videoEmbedUrl) {
      // Procurar thumbnails no markdown que indicam vídeos disponíveis
      const thumbnailMatches = markdown.match(/https:\/\/d2n97g4vasjwsk\.cloudfront\.net\/[^\s\)]+\.webp/gi);
      if (thumbnailMatches && thumbnailMatches.length > 0) {
        // IMPORTANTE: Usar o videoUrl ORIGINAL passado para a função (não a URL de sucesso)
        // Isso garante que buscamos pelo procedimento correto mesmo quando caímos na página base do veículo

        // Extrair o procedimento da URL original
        let procedureSlug: string;
        let categorySlug: string;

        // Verificar se é um procedimento simples (sem barras) ou uma URL completa
        if (!videoUrl.includes('/') || videoUrl.startsWith('http') === false && videoUrl.split('/').length <= 2) {
          // Procedimento simples como "battery" ou "oil_change"
          procedureSlug = videoUrl.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
          categorySlug = ''; // Sem categoria específica
        } else {
          // URL com caminho - extrair partes
          procedureSlug = videoUrl.split('/').pop()?.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ') || "";
          categorySlug = videoUrl.split('/').slice(-2, -1)[0]?.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ') || "";
        }

        // Normalizar o procedimento para busca (oil_change -> oil change, change_oil -> change oil)
        const normalizedProcedure = procedureSlug.replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase();
        const procedureWords = normalizedProcedure.split(' ').filter(w => w.length > 2);

        console.log(`Looking for video matching procedure: "${normalizedProcedure}" (words: ${procedureWords.join(', ')}), category: "${categorySlug}"`);

        // Mapear termos comuns para palavras-chave nas thumbnails
        const keywordMap: Record<string, string[]> = {
          // Oil related
          'oil change': ['oil', 'motor oil', 'oil fill', 'oil drain', 'oil filter', 'engine oil'],
          'change oil': ['oil', 'motor oil', 'oil fill', 'oil drain', 'oil filter', 'engine oil'],
          'oil': ['oil', 'motor oil', 'oil fill', 'oil drain', 'oil filter', 'engine oil'],
          // Battery - expanded keywords
          'battery': ['battery', 'bateria', 'jump start', 'battery locate', 'battery clean', 'battery replacement'],
          'battery replacement': ['battery', 'battery locate', 'battery clean', 'battery replacement', 'jump start'],
          'replace battery': ['battery', 'battery locate', 'battery clean', 'battery replacement'],
          'jump start': ['battery', 'jump start', 'jumper'],
          // Air filters - expanded keywords
          'air filter': ['air filter', 'filtro de ar', 'air filter engine', 'engine air filter'],
          'air filter cabin': ['cabin', 'air filter cabin', 'cabin filter', 'cabin air filter'],
          'air filter engine': ['air filter engine', 'engine filter', 'air filter'],
          'cabin air filter': ['cabin', 'air filter cabin', 'cabin filter', 'cabin air filter'],
          'engine air filter': ['air filter engine', 'engine filter', 'air filter', 'engine air filter'],
          // Brakes - expanded keywords
          'brakes': ['brake', 'freio', 'brake fluid', 'brake pad', 'brake light'],
          'brake fluid': ['brake fluid', 'brake', 'reservoir', 'check fluid'],
          'brake pad': ['brake pad', 'brake', 'brakes'],
          'brake rotors': ['brake rotor', 'rotor', 'brake disc', 'disc', 'rotors', 'brake rotors'],
          'brake rotor': ['brake rotor', 'rotor', 'brake disc', 'disc', 'rotors'],
          // Lights - expanded
          'headlight': ['headlight', 'farol', 'headlamp', 'bulb', 'front light'],
          'taillight': ['taillight', 'tail light', 'brake light', 'rear light'],
          'fog light': ['fog light', 'fog lamp'],
          // Fluids - expanded
          'coolant': ['coolant', 'antifreeze', 'radiator', 'reservoir', 'overflow'],
          'windshield washer': ['washer', 'washer fluid', 'windshield washer'],
          // Wipers
          'wipers': ['wiper', 'windshield', 'wiper blade'],
          'wiper blade': ['wiper', 'wiper blade', 'windshield wiper'],
          'windshield': ['wiper', 'windshield', 'washer'],
          // AC
          'air conditioner': ['air conditioning', 'a/c', 'ac', 'freon', 'recharge'],
          'recharge freon': ['freon', 'a/c', 'ac', 'air conditioning', 'recharge'],
          // Check engine
          'check engine light': ['obd', 'check engine', 'diagnose', 'engine light'],
          // Tire
          'tire': ['tire', 'pneu', 'wheel', 'spare'],
          'flat tire': ['tire', 'spare', 'flat', 'change tire'],
          'spare tire': ['spare', 'tire', 'spare tire'],
          // Fuses
          'fuse': ['fuse', 'fuse box', 'fusible'],
          // Spark plugs - expanded
          'spark plug': ['spark plug', 'spark', 'ignition', 'plug', 'spark plugs', 'spark gap'],
          'spark plugs': ['spark plug', 'spark', 'ignition', 'plug', 'spark plugs', 'spark gap'],
          'ignition': ['spark plug', 'spark', 'ignition', 'coil', 'ignition coil'],
          // Transmission fluid - expanded
          'transmission fluid': ['transmission', 'trans fluid', 'transmission check', 'transmission level', 'atf', 'auto transmission'],
          'transmission': ['transmission', 'trans fluid', 'transmission check', 'atf', 'gearbox'],
          'trans fluid': ['transmission', 'trans fluid', 'transmission check', 'atf'],
          'check transmission': ['transmission', 'trans fluid', 'transmission check', 'atf level'],
          'automatic transmission': ['transmission', 'automatic transmission', 'atf', 'trans fluid'],
          // Power steering - expanded
          'power steering': ['power steering', 'steering fluid', 'steering pump', 'ps fluid', 'steering'],
          'power steering fluid': ['power steering', 'steering fluid', 'steering pump', 'ps fluid'],
          'steering fluid': ['power steering', 'steering fluid', 'steering'],
          'steering': ['power steering', 'steering fluid', 'steering pump', 'steering wheel'],
          // Timing belt
          'timing belt': ['timing belt', 'timing chain', 'timing', 'cam belt', 'belt replacement', 'timing cover'],
          'timing chain': ['timing chain', 'timing', 'chain', 'timing cover'],
          'timing': ['timing belt', 'timing chain', 'timing', 'cam belt'],
          // Serpentine belt
          'serpentine belt': ['serpentine belt', 'serpentine', 'drive belt', 'accessory belt', 'belt', 'fan belt'],
          'serpentine': ['serpentine belt', 'serpentine', 'drive belt', 'accessory belt'],
          'drive belt': ['serpentine belt', 'drive belt', 'belt', 'accessory belt'],
          'accessory belt': ['serpentine belt', 'accessory belt', 'drive belt'],
          // Thermostat
          'thermostat': ['thermostat', 'cooling', 'overheat', 'temperature', 'coolant flow'],
          'temperature': ['thermostat', 'temperature', 'cooling', 'overheat'],
          // Water pump
          'water pump': ['water pump', 'pump', 'coolant pump', 'cooling', 'water', 'coolant circulation'],
          'water': ['water pump', 'coolant', 'cooling system'],
          'coolant pump': ['water pump', 'coolant pump', 'pump'],
          // Alternator - NEW
          'alternator': ['alternator', 'charging', 'generator', 'alternator belt', 'charging system', 'battery charge'],
          'charging': ['alternator', 'charging system', 'battery', 'generator'],
          'generator': ['alternator', 'generator', 'charging'],
          // Starter motor - NEW
          'starter': ['starter', 'starter motor', 'starting', 'crank', 'ignition', 'start motor'],
          'starter motor': ['starter', 'starter motor', 'starting system', 'crank', 'solenoid', 'start motor'],
          'starting': ['starter', 'starter motor', 'starting', 'crank'],
          // Wheel bearing - NEW
          'wheel bearing': ['wheel bearing', 'bearing', 'hub', 'hub bearing', 'wheel hub', 'front bearing', 'rear bearing'],
          'bearing': ['wheel bearing', 'bearing', 'hub bearing'],
          'hub bearing': ['wheel bearing', 'hub bearing', 'hub', 'wheel hub'],
          'wheel hub': ['wheel hub', 'hub', 'wheel bearing', 'hub assembly'],
          // Brake rotors - NEW
          'rotors': ['brake rotor', 'rotor', 'brake disc', 'disc', 'rotors', 'brake rotors'],
          'brake disc': ['brake rotor', 'rotor', 'brake disc', 'disc'],
          'disc': ['brake rotor', 'rotor', 'brake disc', 'disc'],
          // CV Axle - NEW
          'cv axle': ['cv axle', 'cv shaft', 'axle', 'cv joint', 'halfshaft', 'drive axle', 'cv boot', 'axle shaft'],
          'cv shaft': ['cv axle', 'cv shaft', 'axle', 'halfshaft', 'drive shaft'],
          'axle': ['cv axle', 'axle', 'halfshaft', 'drive axle', 'axle shaft'],
          'cv joint': ['cv joint', 'cv axle', 'joint', 'constant velocity'],
          'halfshaft': ['cv axle', 'halfshaft', 'cv shaft', 'half shaft', 'axle'],
          'cv boot': ['cv boot', 'boot', 'cv axle', 'axle boot'],
          // Control arm - NEW
          'control arm': ['control arm', 'arm', 'lower arm', 'upper arm', 'suspension arm', 'wishbone', 'a-arm', 'lower control'],
          'lower control arm': ['lower control arm', 'control arm', 'lower arm', 'suspension', 'lca'],
          'upper control arm': ['upper control arm', 'control arm', 'upper arm', 'uca'],
          'suspension arm': ['control arm', 'suspension arm', 'arm', 'wishbone'],
          'wishbone': ['wishbone', 'control arm', 'a-arm', 'suspension'],
          // Ball joint - NEW
          'ball joint': ['ball joint', 'joint', 'ball', 'lower ball joint', 'upper ball joint', 'suspension joint'],
          'lower ball joint': ['ball joint', 'lower ball joint', 'lower joint', 'ball'],
          'upper ball joint': ['ball joint', 'upper ball joint', 'upper joint', 'ball'],
          // Tie rod - NEW
          'tie rod': ['tie rod', 'tie', 'rod', 'inner tie rod', 'outer tie rod', 'tie rod end', 'steering linkage'],
          'tie rod end': ['tie rod end', 'tie rod', 'outer tie rod', 'tie', 'steering'],
          'inner tie rod': ['inner tie rod', 'tie rod', 'inner tie', 'rack end'],
          'outer tie rod': ['outer tie rod', 'tie rod', 'outer tie', 'tie rod end'],
          'steering linkage': ['tie rod', 'steering linkage', 'steering', 'linkage'],
          // Sway bar link - NEW
          'sway bar': ['sway bar', 'stabilizer', 'anti-roll bar', 'sway bar link', 'stabilizer link', 'end link'],
          'sway bar link': ['sway bar link', 'stabilizer link', 'end link', 'sway bar', 'link'],
          'stabilizer link': ['stabilizer link', 'sway bar link', 'stabilizer', 'end link'],
          'stabilizer bar': ['stabilizer bar', 'sway bar', 'stabilizer', 'anti-roll bar'],
          // Strut - NEW
          'strut': ['strut', 'shock', 'strut assembly', 'suspension strut', 'front strut', 'rear strut', 'macpherson strut'],
          'strut assembly': ['strut assembly', 'strut', 'shock absorber', 'suspension'],
          'front strut': ['front strut', 'strut', 'front suspension', 'front shock'],
          'rear strut': ['rear strut', 'strut', 'rear suspension', 'rear shock'],
          // Shock absorber - NEW
          'shock absorber': ['shock absorber', 'shock', 'absorber', 'damper', 'suspension shock'],
          'shock': ['shock', 'shock absorber', 'damper', 'absorber', 'suspension'],
          'rear shock': ['rear shock', 'shock absorber', 'rear shock absorber', 'shock'],
          'front shock': ['front shock', 'shock absorber', 'front shock absorber', 'shock'],
          // Coil spring - NEW
          'coil spring': ['coil spring', 'spring', 'suspension spring', 'front spring', 'rear spring'],
          'spring': ['spring', 'coil spring', 'suspension spring', 'coil'],
          'suspension spring': ['suspension spring', 'coil spring', 'spring', 'coil'],
          'front spring': ['front spring', 'coil spring', 'front coil spring', 'spring'],
          'rear spring': ['rear spring', 'coil spring', 'rear coil spring', 'spring'],
          // Fuel pump - NEW
          'fuel pump': ['fuel pump', 'fuel', 'pump', 'gas pump', 'fuel module', 'tank pump'],
          'fuel': ['fuel pump', 'fuel', 'fuel filter', 'fuel line', 'fuel tank'],
          'gas pump': ['fuel pump', 'gas pump', 'pump', 'fuel'],
          'fuel module': ['fuel pump', 'fuel module', 'pump module', 'tank'],
          // Oxygen sensor - NEW
          'oxygen sensor': ['oxygen sensor', 'o2 sensor', 'lambda', 'exhaust sensor', 'o2', 'emissions sensor'],
          'o2 sensor': ['oxygen sensor', 'o2 sensor', 'o2', 'lambda', 'exhaust sensor'],
          'lambda': ['lambda', 'oxygen sensor', 'o2 sensor', 'lambda sensor'],
          'exhaust sensor': ['oxygen sensor', 'exhaust sensor', 'o2 sensor', 'lambda'],
          // Catalytic converter - NEW
          'catalytic converter': ['catalytic converter', 'catalytic', 'converter', 'cat', 'catalyst', 'emission'],
          'catalytic': ['catalytic converter', 'catalytic', 'cat', 'converter'],
          'cat': ['catalytic converter', 'cat', 'catalyst', 'converter'],
          'converter': ['catalytic converter', 'converter', 'cat'],
          // Exhaust system - NEW
          'exhaust': ['exhaust', 'exhaust system', 'muffler', 'exhaust pipe', 'tailpipe', 'silencer'],
          'exhaust system': ['exhaust', 'exhaust system', 'muffler', 'pipe', 'silencer'],
          'muffler': ['muffler', 'exhaust', 'silencer', 'exhaust muffler'],
          'exhaust pipe': ['exhaust pipe', 'exhaust', 'pipe', 'tailpipe'],
          'silencer': ['silencer', 'muffler', 'exhaust'],
        };

        // Ordenar thumbnails por relevância (as que contêm o procedimento primeiro)
        const rankedThumbnails = thumbnailMatches
          .map(thumb => {
            const thumbLower = decodeURIComponent(thumb.replace(/\+/g, ' ')).toLowerCase();
            let score = 0;

            // Pontuação baseada em correspondência direta com procedimento
            if (normalizedProcedure && thumbLower.includes(normalizedProcedure)) score += 15;
            if (categorySlug && thumbLower.includes(categorySlug)) score += 5;

            // Pontuação por palavras individuais do procedimento encontradas na thumbnail
            for (const word of procedureWords) {
              if (thumbLower.includes(word)) score += 6;
            }

            // Buscar keywords mapeados para o procedimento
            const keywords = keywordMap[normalizedProcedure] || [];
            for (const keyword of keywords) {
              if (thumbLower.includes(keyword)) score += 8;
            }

            // Tentar todas as combinações de palavras no keywordMap
            for (const [key, values] of Object.entries(keywordMap)) {
              // Verificar se o procedimento contém alguma das palavras da chave
              const keyWords = key.split(' ');
              const procedureMatchesKey = keyWords.every(kw => normalizedProcedure.includes(kw)) ||
                normalizedProcedure.split(' ').some(pw => keyWords.includes(pw));
              if (procedureMatchesKey) {
                for (const value of values) {
                  if (thumbLower.includes(value)) score += 6;
                }
              }
            }

            // Penalizar thumbnails de "Review" se buscando procedimento específico
            if (normalizedProcedure && thumbLower.includes('review') && !normalizedProcedure.includes('review')) {
              score -= 10;
            }

            // Penalizar thumbnails genéricas (vehicle, front, etc.)
            if (thumbLower.includes('vehicle -') || thumbLower.includes('/front.')) {
              score -= 5;
            }

            // Extrair nome do procedimento da thumbnail para exibição
            const thumbPath = decodeURIComponent(thumb.replace(/\+/g, ' '));
            const thumbName = thumbPath
              .split('/')
              .pop()
              ?.replace(/\s*-\s*\d+p\.webp$/i, '')
              ?.replace(/\.webp$/i, '')
              ?.replace(/ - Part \d+/i, '')
              ?.trim() || '';

            return { url: thumb, score, name: thumbName };
          })
          .filter(t => t.score > 0) // Só considerar thumbnails com alguma relevância
          .sort((a, b) => b.score - a.score);

        // Se nenhuma thumbnail teve score > 0, usar todas ordenadas
        const thumbnailsToTry = rankedThumbnails.length > 0 ? rankedThumbnails :
          thumbnailMatches.map(url => ({ url, score: 0, name: '' }));

        console.log(`Found ${thumbnailsToTry.length} thumbnails, best match score: ${thumbnailsToTry[0]?.score}`);

        // Coletar TODOS os vídeos relacionados (não só o primeiro)
        // Mas APENAS os que são realmente relevantes para o procedimento (score mínimo)
        const relatedVideosFound: Array<{ url: string; name: string; score: number; verified: boolean }> = [];
        const seenUrls = new Set<string>();
        const MIN_SCORE_FOR_RELATED = 5; // Score mínimo para considerar como relacionado

        // Tentar as thumbnails em ordem de relevância
        for (const { url: thumbUrl, score, name } of thumbnailsToTry.slice(0, 10)) { // Limitar a 10 para performance
          // Converter URL de thumbnail para URL de vídeo
          // Remover " - 480p.webp" ou similares e adicionar ".mp4"
          let videoUrlFromThumb = thumbUrl
            .replace(/%20/g, '+')
            .replace(/\s*-\s*\d+p\.webp$/i, '.mp4')
            .replace(/\.webp$/i, '.mp4');

          // Evitar duplicatas
          if (seenUrls.has(videoUrlFromThumb)) continue;

          // Verificar se parece uma URL de vídeo válida
          if (videoUrlFromThumb.includes('.mp4')) {
            // Verificar se o vídeo existe (fazer HEAD request rápido)
            try {
              const headResponse = await fetch(videoUrlFromThumb, { method: 'HEAD' });
              if (headResponse.ok) {
                seenUrls.add(videoUrlFromThumb);

                // O primeiro vídeo verificado é o principal
                if (!videoEmbedUrl) {
                  videoEmbedUrl = videoUrlFromThumb;
                  videoSource = "cloudfront";
                  console.log("Primary video URL:", videoEmbedUrl);
                } else if (score >= MIN_SCORE_FOR_RELATED) {
                  // Só adicionar como relacionado se tiver score suficiente e não for o principal
                  relatedVideosFound.push({
                    url: videoUrlFromThumb,
                    name: name || 'Vídeo',
                    score,
                    verified: true,
                  });
                }
              }
            } catch (e) {
              // Ignorar erros de verificação
            }
          }
        }

        console.log(`Found ${relatedVideosFound.length} verified related videos (score >= ${MIN_SCORE_FOR_RELATED})`);

        // Armazenar vídeos relacionados para uso posterior (sem o vídeo principal)
        if (relatedVideosFound.length > 0) {
          // @ts-ignore - Adicionar propriedade temporária
          validData.relatedVideos = relatedVideosFound;
        }
      }
    }

    // Prioridade 8: Extrair link para página de vídeo específica do CarCareKiosk
    // O markdown pode conter links para vídeos específicos como:
    // [Procedure Name](https://www.carcarekiosk.com/video/YEAR_BRAND_MODEL/category/procedure)
    if (!videoEmbedUrl) {
      const videoPageMatches = markdown.match(/\(https:\/\/www\.carcarekiosk\.com\/video\/[^\)]+\)/gi);
      if (videoPageMatches && videoPageMatches.length > 0) {
        // Extrair a URL do procedimento específico que foi solicitado
        const procedureSlug = videoUrl.split('/').pop() || "";
        const categorySlug = videoUrl.split('/').slice(-2, -1)[0] || "";

        for (const match of videoPageMatches) {
          const pageUrl = match.slice(1, -1); // Remove parênteses
          // Verificar se a URL corresponde ao procedimento solicitado
          if (pageUrl.includes(procedureSlug) || pageUrl.includes(categorySlug)) {
            console.log("Found specific video page URL:", pageUrl);

            // Tentar buscar a página específica do vídeo
            try {
              const videoPageResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: pageUrl,
                  formats: ["html"],
                  waitFor: 2000,
                }),
              });

              if (videoPageResponse.ok) {
                const videoPageData = await videoPageResponse.json();
                const videoPageHtml = videoPageData.data?.html || "";

                // Procurar o vídeo MP4 nesta página específica
                for (const pattern of cloudfrontPatterns) {
                  // Reset lastIndex for global regex
                  pattern.lastIndex = 0;
                  const videoMatch = pattern.exec(videoPageHtml);
                  if (videoMatch && videoMatch[1]) {
                    videoEmbedUrl = videoMatch[1];
                    videoSource = "cloudfront";
                    console.log("Found video in specific procedure page:", videoEmbedUrl);
                    break;
                  }
                }

                if (videoEmbedUrl) break;
              }
            } catch (e) {
              console.log("Failed to fetch video page:", e);
            }
          }
        }
      }
    }

    console.log(`Video extraction result: ${videoSource || 'none'}, URL: ${videoEmbedUrl ? videoEmbedUrl.slice(0, 80) + '...' : 'null'}`);


    // ========== EXTRAIR TÍTULO ==========
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : metadata.title || "Tutorial";

    // ========== EXTRAIR THUMBNAIL/POSTER ==========
    let thumbnailUrl: string | null = null;
    const posterMatch = html.match(/<video[^>]*poster="([^"]+)"/i);
    if (posterMatch) {
      thumbnailUrl = posterMatch[1];
    }

    // ========== EXTRAIR DESCRIÇÃO DO PROCEDIMENTO ==========
    // O CarCareKiosk tem a descrição em um <p> logo após o <h2> ou diretamente no conteúdo
    let procedureDescription = "";
    const descParagraphMatch = html.match(/<p[^>]*class="[^"]*mb-2[^"]*"[^>]*>(?:<span[^>]*>)?([^<]+)/i);
    if (descParagraphMatch) {
      procedureDescription = descParagraphMatch[1].trim();
    }

    // Fallback: primeira linha significativa após h1
    if (!procedureDescription) {
      const firstParagraphMatch = html.match(/<h1[^>]*>[^<]+<\/h1>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/i);
      if (firstParagraphMatch) {
        procedureDescription = firstParagraphMatch[1].trim();
      }
    }

    // Extract basic steps from HTML as fallback
    const htmlSteps: string[] = [];
    const stepRegex = /<li[^>]*>([^<]+)<\/li>/gi;
    let stepMatch;
    while ((stepMatch = stepRegex.exec(html)) !== null) {
      const step = stepMatch[1].trim();
      if (step.length > 10 && step.length < 500) {
        htmlSteps.push(step);
      }
    }

    // Extract "Video Description" section from the sidebar
    let videoDescription = "";

    // Try to find "Video Description" heading and its content
    const videoDescRegex = /Video\s*Description[\s\S]*?<\/h[23]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
    const descMatches: string[] = [];
    let descMatch;
    while ((descMatch = videoDescRegex.exec(html)) !== null) {
      const content = descMatch[1].replace(/<[^>]+>/g, '').trim();
      if (content.length > 50) {
        descMatches.push(content);
      }
    }

    if (descMatches.length > 0) {
      videoDescription = descMatches.join('\n\n');
    }

    // Alternative: Try to extract from markdown (often has better formatting)
    if (!videoDescription && markdown) {
      const markdownDescRegex = /Video\s*Description[\s\n]+([\s\S]+?)(?=\n##|\n\*\*[A-Z]|$)/i;
      const mdMatch = markdown.match(markdownDescRegex);
      if (mdMatch) {
        videoDescription = mdMatch[1]
          .replace(/\*\*/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }
    }

    // Fallback: Look for any substantial paragraph content after main content area
    if (!videoDescription) {
      const paragraphRegex = /<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
      while ((descMatch = paragraphRegex.exec(html)) !== null) {
        const content = descMatch[1].replace(/<[^>]+>/g, '').trim();
        if (content.length > 100) {
          videoDescription += (videoDescription ? '\n\n' : '') + content;
        }
      }
    }

    console.log(`Extracted video description: ${videoDescription.slice(0, 100)}...`);

    // ========== GERAR PASSO A PASSO ELABORADO ==========
    let elaboratedSteps: string[] = [];
    let transcriptionUsed = false;
    let originalTranscription: string | null = null;

    // O CarCareKiosk usa vídeos próprios (não YouTube), então não podemos transcrever
    // Em vez disso, vamos gerar passos com IA baseados no título e contexto

    // Primeiro, tentar extrair passos do próprio HTML/Markdown
    // O CarCareKiosk tem descrições curtas, então precisamos gerar passos detalhados

    if (htmlSteps.length === 0 && videoEmbedUrl) {
      // Gerar passos detalhados usando IA baseado no título e contexto
      console.log("No steps found in HTML, generating steps with AI...");

      const procedureSlug = videoUrl.split('/').pop() || "";
      const categorySlug = videoUrl.split('/').slice(-2, -1)[0] || "";

      // Usar os passos estáticos de fallback como base, mas traduzir e adaptar
      const staticSteps = generateStaticFallbackSteps(procedureSlug, categorySlug, vehicleContext);

      if (staticSteps.length > 0) {
        elaboratedSteps = staticSteps;
        console.log(`Using ${staticSteps.length} static fallback steps`);
      } else {
        // Gerar passos genéricos personalizados
        elaboratedSteps = await generateStepsWithAI(title, procedureDescription, vehicleContext);
      }
    } else if (htmlSteps.length > 0) {
      // Traduzir passos do HTML para português
      console.log(`Translating ${htmlSteps.length} HTML steps...`);
      const translatedContent = await translateToPortuguese({
        steps: htmlSteps,
      });
      elaboratedSteps = translatedContent.steps || htmlSteps;
    }

    // Garantir que sempre temos passos
    if (elaboratedSteps.length === 0) {
      const procedureSlug = videoUrl.split('/').pop() || "";
      const categorySlug = videoUrl.split('/').slice(-2, -1)[0] || "";
      elaboratedSteps = generateStaticFallbackSteps(procedureSlug, categorySlug, vehicleContext);
    }

    // Traduzir título e descrição
    const translatedMeta = await translateToPortuguese({
      title,
      description: metadata.description || procedureDescription || "",
      videoDescription: videoDescription || procedureDescription || undefined,
    });

    // Extrair vídeos relacionados se disponíveis
    // @ts-ignore - Acessar propriedade temporária
    const relatedVideos = validData?.relatedVideos || [];

    const result = {
      title: translatedMeta.title || title,
      description: translatedMeta.description || metadata.description || procedureDescription || "",
      videoDescription: translatedMeta.videoDescription || videoDescription || procedureDescription || undefined,
      videoUrl: videoEmbedUrl,
      videoSource: videoSource,
      thumbnailUrl: thumbnailUrl,
      sourceUrl: successfulUrl,
      steps: elaboratedSteps,
      transcriptionUsed,
      fromCache: false,
      markdown: markdown.slice(0, 5000),
      // Incluir vídeos relacionados (outros procedimentos na mesma categoria)
      relatedVideos: relatedVideos.length > 1 ? relatedVideos.map((v: any) => ({
        url: v.url,
        name: v.name,
      })) : undefined,
    };

    // ========== SALVAR NO CACHE ==========
    // Para vídeos CloudFront, usamos a URL do vídeo como identificador
    const cacheVideoId = videoSource === "cloudfront"
      ? videoEmbedUrl?.split('/').pop()?.replace('.mp4', '') || null
      : youtubeVideoId;

    await saveToCache({
      video_url: successfulUrl,
      youtube_video_id: cacheVideoId || undefined,
      original_transcription: originalTranscription || undefined,
      elaborated_steps: result.steps,
      translated_title: result.title,
      translated_description: result.description,
      translated_video_description: result.videoDescription,
      transcription_used: transcriptionUsed,
      vehicle_context: vehicleContext,
    });

    return result;
  } catch (error) {
    console.error("Error fetching video details:", error);
    // Retornar objeto com erro mas com sourceUrl para fallback
    return {
      title: "Erro ao Carregar",
      description: "Ocorreu um erro ao processar o tutorial.",
      videoUrl: null,
      sourceUrl: videoUrl.startsWith('http') ? videoUrl : `https://www.carcarekiosk.com${videoUrl}`,
      steps: [],
      transcriptionUsed: false,
      fromCache: false,
      error: true,
      errorMessage: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

// Buscar vídeos por pesquisa
async function searchCarCareKiosk(
  apiKey: string,
  query: string,
  brand?: string,
  model?: string,
  year?: string
): Promise<any[]> {
  try {
    let searchQuery = `site:carcarekiosk.com ${query}`;
    if (brand) searchQuery += ` ${brand}`;
    if (model) searchQuery += ` ${model}`;
    if (year) searchQuery += ` ${year}`;

    console.log(`Searching CarCareKiosk: ${searchQuery}`);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 20,
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl search error:", response.status);
      return [];
    }

    const data = await response.json();
    const results = data.data || [];

    return results.map((result: any) => ({
      title: result.title?.replace(/\s*\|\s*CarCareKiosk.*$/i, "").trim() || "",
      description: result.description || "",
      url: result.url,
      thumbnail: null,
    }));
  } catch (error) {
    console.error("Error searching CarCareKiosk:", error);
    return [];
  }
}

// Busca local nos dados estáticos (placeholder for now, could be implemented with DB)
function searchStaticData(query: string, brand?: string, model?: string): any[] {
  return [];
}

// Gerar passos estáticos de fallback baseados na categoria e procedimento
