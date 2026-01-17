import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CarCareRequest {
  action: "brands" | "models" | "videos" | "video-details" | "search";
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

// Verificar cache de transcrição
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

    if (data) {
      console.log("Cache hit for video:", videoUrl);
    }

    return data;
  } catch (err) {
    console.error("Cache lookup error:", err);
    return null;
  }
}

// Salvar transcrição no cache
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
      console.log("Saved to cache:", cacheData.video_url);
    }
  } catch (err) {
    console.error("Cache save error:", err);
  }
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
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.log("LOVABLE_API_KEY not configured, skipping step generation");
    return [];
  }

  try {
    console.log("Generating elaborated steps from transcription...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um mecânico experiente brasileiro que cria tutoriais de manutenção automotiva detalhados e fáceis de seguir.

Sua tarefa é analisar a transcrição de um vídeo tutorial automotivo e criar um passo a passo ELABORADO e BEM ESTRUTURADO em português brasileiro.

REGRAS IMPORTANTES:
1. Crie passos CLAROS, DETALHADOS e em SEQUÊNCIA LÓGICA
2. Inclua dicas de segurança quando relevante (use ⚠️)
3. Mencione ferramentas específicas necessárias em cada passo
4. Adicione observações úteis baseadas na transcrição
5. Use linguagem técnica mas acessível
6. Numere cada passo com emoji (1️⃣, 2️⃣, 3️⃣...)
7. Cada passo deve ter 2-4 frases explicativas
8. Máximo de 10-15 passos

FORMATO DE SAÍDA: JSON array de strings, cada string é um passo completo.
Exemplo: ["1️⃣ Primeiro passo...", "2️⃣ Segundo passo..."]

RETORNE APENAS O JSON, sem explicações adicionais.`
          },
          {
            role: "user",
            content: `TÍTULO DO VÍDEO: ${title}
${vehicleContext ? `VEÍCULO: ${vehicleContext}` : ""}

TRANSCRIÇÃO DO VÍDEO:
${transcription.slice(0, 8000)}

Crie o passo a passo elaborado em português brasileiro:`
          }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      console.error("Step generation API error:", response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content received from step generation");
      return [];
    }

    // Parse the JSON response
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }

    const steps = JSON.parse(cleanedContent.trim());
    
    if (Array.isArray(steps)) {
      console.log(`Generated ${steps.length} elaborated steps`);
      return steps;
    }

    return [];
  } catch (error) {
    console.error("Step generation error:", error);
    return [];
  }
}

// Traduzir conteúdo para português usando Lovable AI
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
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.log("LOVABLE_API_KEY not configured, skipping translation");
    return content;
  }

  // Prepare content for translation
  const textsToTranslate: string[] = [];
  const keys: string[] = [];

  if (content.title) {
    textsToTranslate.push(content.title);
    keys.push("title");
  }
  if (content.description) {
    textsToTranslate.push(content.description);
    keys.push("description");
  }
  if (content.videoDescription) {
    textsToTranslate.push(content.videoDescription);
    keys.push("videoDescription");
  }
  if (content.steps && content.steps.length > 0) {
    content.steps.forEach((step, i) => {
      textsToTranslate.push(step);
      keys.push(`step_${i}`);
    });
  }

  if (textsToTranslate.length === 0) {
    return content;
  }

  try {
    console.log(`Translating ${textsToTranslate.length} texts to Portuguese...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um tradutor especializado em conteúdo automotivo. Traduza o texto do inglês para o português brasileiro de forma clara e natural.

REGRAS:
- Mantenha termos técnicos automotivos quando apropriados (ex: OBD, ECU, R134a)
- Use linguagem acessível para mecânicos e entusiastas
- Traduza unidades de medida quando relevante
- Não adicione ou remova informações
- Retorne APENAS o JSON com as traduções, sem explicações

FORMATO DE ENTRADA: JSON com chaves e textos em inglês
FORMATO DE SAÍDA: JSON com as mesmas chaves e textos traduzidos para português`
          },
          {
            role: "user",
            content: JSON.stringify(
              textsToTranslate.reduce((acc, text, i) => {
                acc[keys[i]] = text;
                return acc;
              }, {} as Record<string, string>)
            )
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("Translation API error:", response.status);
      return content;
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content;

    if (!translatedContent) {
      console.error("No translation content received");
      return content;
    }

    // Parse the translated JSON
    let translations: Record<string, string>;
    try {
      // Clean up the response (remove markdown code blocks if present)
      let cleanedContent = translatedContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      translations = JSON.parse(cleanedContent.trim());
    } catch (e) {
      console.error("Failed to parse translation JSON:", e);
      return content;
    }

    // Build translated content
    const result: typeof content = {};

    if (translations.title) {
      result.title = translations.title;
    } else if (content.title) {
      result.title = content.title;
    }

    if (translations.description) {
      result.description = translations.description;
    } else if (content.description) {
      result.description = content.description;
    }

    if (translations.videoDescription) {
      result.videoDescription = translations.videoDescription;
    } else if (content.videoDescription) {
      result.videoDescription = content.videoDescription;
    }

    if (content.steps && content.steps.length > 0) {
      result.steps = content.steps.map((_, i) => {
        return translations[`step_${i}`] || content.steps![i];
      });
    }

    console.log("Translation completed successfully");
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    return content;
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
          return new Response(
            JSON.stringify({ success: true, data: getStaticBrands() }),
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
          return new Response(
            JSON.stringify({ success: true, data: getStaticModels(brand) }),
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
          return new Response(
            JSON.stringify({ success: true, data: getStaticCategories(brand, model, year) }),
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
          // Busca local nos dados estáticos
          const results = searchStaticData(query, brand, model);
          return new Response(
            JSON.stringify({ success: true, data: results }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const results = await searchCarCareKiosk(FIRECRAWL_API_KEY, query, brand, model, year);
        return new Response(
          JSON.stringify({ success: true, data: results }),
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
      return getStaticBrands();
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
      return getStaticBrands();
    }

    return brands.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return getStaticBrands();
  }
}

// Buscar modelos de uma marca do CarCareKiosk
async function fetchModelsFromCarCareKiosk(apiKey: string, brand: string): Promise<any[]> {
  try {
    const brandSlug = brand.toLowerCase().replace(/\s+/g, "-");
    const url = `https://www.carcarekiosk.com/make/${brandSlug}`;
    
    console.log(`Fetching models for ${brand} from ${url}...`);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html"],
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl error fetching models:", response.status);
      return getStaticModels(brand);
    }

    const data = await response.json();
    const html = data.data?.html || "";
    
    const models: any[] = [];
    const seen = new Set();

    const modelRegex = /<a[^>]*href="(\/video\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[\s\S]*?<\/a>/gi;
    
    let match;
    while ((match = modelRegex.exec(html)) !== null) {
      const [, videoPath, imageUrl] = match;
      
      const pathMatch = videoPath.match(/\/video\/(\d{4})_([^\/]+)/);
      if (pathMatch) {
        const year = pathMatch[1];
        const modelSlug = pathMatch[2];
        const modelName = formatModelName(modelSlug, brand);
        const key = modelName.toLowerCase();
        
        if (!seen.has(key)) {
          seen.add(key);
          models.push({
            id: videoPath.replace('/video/', ''),
            name: modelName,
            years: year,
            image: imageUrl.startsWith('http') ? imageUrl : `https://www.carcarekiosk.com${imageUrl}`,
            url: `https://www.carcarekiosk.com${videoPath}`,
          });
        }
      }
    }

    if (models.length === 0) {
      const altRegex = /href="\/video\/(\d{4})_([^"\/]+)(?:\/([^"]+))?"/gi;
      while ((match = altRegex.exec(html)) !== null) {
        const [, year, modelSlug] = match;
        const modelName = formatModelName(modelSlug, brand);
        const key = modelName.toLowerCase();
        
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
    }

    console.log(`Found ${models.length} models for ${brand}`);
    
    if (models.length === 0) {
      return getStaticModels(brand);
    }

    return models.sort((a, b) => {
      const yearDiff = parseInt(b.years) - parseInt(a.years);
      if (yearDiff !== 0) return yearDiff;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return getStaticModels(brand);
  }
}

// Buscar vídeos de um modelo específico
async function fetchVideosFromCarCareKiosk(
  apiKey: string, 
  brand: string, 
  model: string, 
  year?: string
): Promise<any[]> {
  try {
    const brandSlug = brand.toLowerCase().replace(/\s+/g, "_");
    const modelSlug = model.toLowerCase().replace(/\s+/g, "_");
    const yearStr = year || new Date().getFullYear().toString();
    const url = `https://www.carcarekiosk.com/video/${yearStr}_${brandSlug}_${modelSlug}`;
    
    console.log(`Fetching videos from ${url}...`);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html", "markdown"],
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl error fetching videos:", response.status);
      return getStaticCategories(brand, model, year);
    }

    const data = await response.json();
    const html = data.data?.html || "";
    const markdown = data.data?.markdown || "";
    
    const categories: any[] = [];
    const seen = new Set();

    const categoryRegex = /<a[^>]*href="(\/video\/[^"]+\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[\s\S]*?([^<]+)<\/a>/gi;
    
    let match;
    while ((match = categoryRegex.exec(html)) !== null) {
      const [, path, thumbnail, title] = match;
      const cleanTitle = title.trim().replace(/\s+/g, ' ');
      
      if (cleanTitle && !seen.has(cleanTitle.toLowerCase())) {
        seen.add(cleanTitle.toLowerCase());
        categories.push({
          id: path.split('/').pop() || cleanTitle.toLowerCase().replace(/\s+/g, '-'),
          name: cleanTitle,
          nameEn: cleanTitle,
          icon: getCategoryIcon(cleanTitle),
          thumbnail: thumbnail.startsWith('http') ? thumbnail : `https://www.carcarekiosk.com${thumbnail}`,
          url: `https://www.carcarekiosk.com${path}`,
          vehicleContext: `${brand} ${model} ${year || ""}`,
        });
      }
    }

    if (categories.length === 0) {
      const linkRegex = /\[([^\]]+)\]\((\/video\/[^\)]+)\)/gi;
      while ((match = linkRegex.exec(markdown)) !== null) {
        const [, title, path] = match;
        const cleanTitle = title.trim();
        
        if (cleanTitle && !seen.has(cleanTitle.toLowerCase()) && path.includes('/')) {
          seen.add(cleanTitle.toLowerCase());
          categories.push({
            id: path.split('/').pop() || cleanTitle.toLowerCase().replace(/\s+/g, '-'),
            name: cleanTitle,
            nameEn: cleanTitle,
            icon: getCategoryIcon(cleanTitle),
            url: `https://www.carcarekiosk.com${path}`,
            vehicleContext: `${brand} ${model} ${year || ""}`,
          });
        }
      }
    }

    console.log(`Found ${categories.length} video categories for ${brand} ${model}`);
    
    if (categories.length === 0) {
      return getStaticCategories(brand, model, year);
    }

    return categories;
  } catch (error) {
    console.error("Error fetching videos:", error);
    return getStaticCategories(brand, model, year);
  }
}

// Buscar detalhes de um vídeo específico
async function fetchVideoDetails(apiKey: string, videoUrl: string, vehicleContext?: string, skipCache?: boolean): Promise<any> {
  try {
    const url = videoUrl.startsWith('http') 
      ? videoUrl 
      : `https://www.carcarekiosk.com${videoUrl}`;
    
    console.log(`Fetching video details from ${url}... (skipCache: ${skipCache})`);

    // ========== VERIFICAR CACHE PRIMEIRO (se não skipCache) ==========
    if (!skipCache) {
      const cached = await getCachedTranscription(url);
      if (cached) {
        console.log("Returning cached transcription data");
        return {
          title: cached.translated_title || "Tutorial",
          description: cached.translated_description || "",
          videoDescription: cached.translated_video_description || undefined,
          videoUrl: cached.youtube_video_id ? `https://www.youtube.com/embed/${cached.youtube_video_id}` : null,
          sourceUrl: url,
          steps: cached.elaborated_steps || [],
          transcriptionUsed: cached.transcription_used,
          fromCache: true,
          cacheExpiresAt: cached.expires_at,
        };
      }
    } else {
      console.log("Skipping cache, forcing reprocessing...");
    }

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

    if (!response.ok) {
      console.error("Firecrawl error fetching video details:", response.status);
      return null;
    }

    const data = await response.json();
    const html = data.data?.html || "";
    const markdown = data.data?.markdown || "";
    const metadata = data.data?.metadata || {};
    
    let videoEmbedUrl = null;
    let youtubeVideoId: string | null = null;
    const iframeMatch = html.match(/src="(https:\/\/www\.youtube\.com\/embed\/([^"?]+))"/);
    if (iframeMatch) {
      videoEmbedUrl = iframeMatch[1];
      youtubeVideoId = iframeMatch[2];
    }
    
    if (!videoEmbedUrl) {
      const youtubeMatch = markdown.match(/youtube\.com\/(?:watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) {
        youtubeVideoId = youtubeMatch[1];
        videoEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;
      }
    }

    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : metadata.title || "Tutorial";

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

    // ========== PASSO A PASSO ELABORADO VIA TRANSCRIÇÃO ==========
    let elaboratedSteps: string[] = [];
    let transcriptionUsed = false;
    let originalTranscription: string | null = null;

    // Tentar transcrever o vídeo do YouTube
    if (videoEmbedUrl) {
      console.log("Attempting to transcribe YouTube video...");
      const transcription = await transcribeYouTubeVideo(videoEmbedUrl);
      
      if (transcription && transcription.length > 100) {
        console.log("Transcription successful, generating elaborated steps...");
        originalTranscription = transcription;
        elaboratedSteps = await generateElaboratedSteps(transcription, title, vehicleContext);
        transcriptionUsed = elaboratedSteps.length > 0;
      }
    }

    // Se não conseguiu transcrição, traduzir passos do HTML
    let finalSteps = elaboratedSteps;
    
    if (!transcriptionUsed && htmlSteps.length > 0) {
      console.log("Using HTML steps with translation...");
      const translatedContent = await translateToPortuguese({
        steps: htmlSteps,
      });
      finalSteps = translatedContent.steps || htmlSteps;
    }

    // Traduzir título e descrição
    const translatedMeta = await translateToPortuguese({
      title,
      description: metadata.description || "",
      videoDescription: videoDescription || undefined,
    });

    const result = {
      title: translatedMeta.title || title,
      description: translatedMeta.description || metadata.description || "",
      videoDescription: translatedMeta.videoDescription || videoDescription || undefined,
      videoUrl: videoEmbedUrl,
      sourceUrl: url,
      steps: finalSteps.length > 0 ? finalSteps : htmlSteps,
      transcriptionUsed,
      fromCache: false,
      markdown: markdown.slice(0, 5000),
    };

    // ========== SALVAR NO CACHE ==========
    await saveToCache({
      video_url: url,
      youtube_video_id: youtubeVideoId || undefined,
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
    return null;
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

// Busca local nos dados estáticos
function searchStaticData(query: string, brand?: string, model?: string): any[] {
  const results: any[] = [];
  const queryLower = query.toLowerCase();
  const brands = getStaticBrands();
  
  for (const b of brands) {
    if (brand && b.name.toLowerCase() !== brand.toLowerCase()) continue;
    
    const models = getStaticModels(b.name);
    for (const m of models) {
      if (model && !m.name.toLowerCase().includes(model.toLowerCase())) continue;
      
      if (m.name.toLowerCase().includes(queryLower) || 
          b.name.toLowerCase().includes(queryLower)) {
        results.push({
          title: `${b.name} ${m.name} ${m.years}`,
          description: `Vídeos de manutenção para ${b.name} ${m.name}`,
          url: m.url,
          thumbnail: m.image,
        });
      }
    }
  }
  
  return results.slice(0, 20);
}

// Helpers
function formatBrandName(slug: string): string {
  const specialNames: Record<string, string> = {
    "bmw": "BMW",
    "gmc": "GMC",
    "ram": "Ram",
    "mini": "MINI",
    "seat": "SEAT",
    "alfa-romeo": "Alfa Romeo",
    "aston-martin": "Aston Martin",
    "land-rover": "Land Rover",
    "mercedes-benz": "Mercedes-Benz",
    "rolls-royce": "Rolls-Royce",
  };
  
  if (specialNames[slug]) {
    return specialNames[slug];
  }
  
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatModelName(slug: string, brand: string): string {
  const brandSlug = brand.toLowerCase().replace(/\s+/g, "_");
  let cleanSlug = slug.replace(new RegExp(`^${brandSlug}_?`, "i"), "");
  
  return cleanSlug
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase();
  
  if (lower.includes("oil") || lower.includes("óleo")) return "🛢️";
  if (lower.includes("brake") || lower.includes("freio")) return "🛑";
  if (lower.includes("battery") || lower.includes("bateria")) return "🔋";
  if (lower.includes("air") || lower.includes("ar") || lower.includes("filter") || lower.includes("filtro")) return "🌬️";
  if (lower.includes("coolant") || lower.includes("arrefec")) return "🌡️";
  if (lower.includes("light") || lower.includes("luz") || lower.includes("headlight") || lower.includes("farol")) return "💡";
  if (lower.includes("tire") || lower.includes("pneu") || lower.includes("wheel")) return "⭕";
  if (lower.includes("wiper") || lower.includes("palheta") || lower.includes("windshield")) return "🪟";
  if (lower.includes("transmission") || lower.includes("câmbio") || lower.includes("transmissão")) return "⚙️";
  if (lower.includes("engine") || lower.includes("motor")) return "🔧";
  if (lower.includes("suspension") || lower.includes("suspensão")) return "🔩";
  if (lower.includes("exhaust") || lower.includes("escapamento")) return "💨";
  if (lower.includes("electrical") || lower.includes("elétric")) return "⚡";
  if (lower.includes("fuse") || lower.includes("fusível")) return "🔌";
  
  return "🔧";
}

// ============================================================================
// DADOS ESTÁTICOS COMPLETOS - 55 MARCAS | 1.357 MODELOS
// Coletados do CarCareKiosk (https://www.carcarekiosk.com)
// ============================================================================

function getStaticBrands(): any[] {
  return [
    { id: "acura", name: "Acura", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Acura_RDX/front.jpg", url: "https://www.carcarekiosk.com/videos/Acura" },
    { id: "alfa-romeo", name: "Alfa Romeo", image: "https://www.carcarekiosk.com/imager/vehicles/2018_Alfa_Romeo_Stelvio/front.jpg", url: "https://www.carcarekiosk.com/videos/Alfa-Romeo" },
    { id: "audi", name: "Audi", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Audi_Q5/front.jpg", url: "https://www.carcarekiosk.com/videos/Audi" },
    { id: "bmw", name: "BMW", image: "https://www.carcarekiosk.com/imager/vehicles/2019_BMW_X3/front.jpg", url: "https://www.carcarekiosk.com/videos/BMW" },
    { id: "buick", name: "Buick", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Buick_Envision/front.jpg", url: "https://www.carcarekiosk.com/videos/Buick" },
    { id: "cadillac", name: "Cadillac", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Cadillac_XT4/front.jpg", url: "https://www.carcarekiosk.com/videos/Cadillac" },
    { id: "chevrolet", name: "Chevrolet", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Chevrolet_Equinox/front.jpg", url: "https://www.carcarekiosk.com/videos/Chevrolet" },
    { id: "chrysler", name: "Chrysler", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Chrysler_Pacifica/front.jpg", url: "https://www.carcarekiosk.com/videos/Chrysler" },
    { id: "citroen", name: "Citroen", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Citroen_C3/front.jpg", url: "https://www.carcarekiosk.com/videos/Citroen" },
    { id: "dacia", name: "Dacia", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Dacia_Duster/front.jpg", url: "https://www.carcarekiosk.com/videos/Dacia" },
    { id: "daewoo", name: "Daewoo", image: "https://www.carcarekiosk.com/imager/vehicles/2002_Daewoo_Lanos/front.jpg", url: "https://www.carcarekiosk.com/videos/Daewoo" },
    { id: "dodge", name: "Dodge", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Dodge_Charger/front.jpg", url: "https://www.carcarekiosk.com/videos/Dodge" },
    { id: "fiat", name: "Fiat", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Fiat_500X/front.jpg", url: "https://www.carcarekiosk.com/videos/Fiat" },
    { id: "ford", name: "Ford", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Ford_Escape/front.jpg", url: "https://www.carcarekiosk.com/videos/Ford" },
    { id: "genesis", name: "Genesis", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Genesis_G70/front.jpg", url: "https://www.carcarekiosk.com/videos/Genesis" },
    { id: "gmc", name: "GMC", image: "https://www.carcarekiosk.com/imager/vehicles/2019_GMC_Terrain/front.jpg", url: "https://www.carcarekiosk.com/videos/GMC" },
    { id: "honda", name: "Honda", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Honda_Civic/front.jpg", url: "https://www.carcarekiosk.com/videos/Honda" },
    { id: "hummer", name: "Hummer", image: "https://www.carcarekiosk.com/imager/vehicles/2006_Hummer_H3/front.jpg", url: "https://www.carcarekiosk.com/videos/Hummer" },
    { id: "hyundai", name: "Hyundai", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Hyundai_Tucson/front.jpg", url: "https://www.carcarekiosk.com/videos/Hyundai" },
    { id: "infiniti", name: "Infiniti", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Infiniti_QX60/front.jpg", url: "https://www.carcarekiosk.com/videos/Infiniti" },
    { id: "isuzu", name: "Isuzu", image: "https://www.carcarekiosk.com/imager/vehicles/2004_Isuzu_Rodeo/front.jpg", url: "https://www.carcarekiosk.com/videos/Isuzu" },
    { id: "jaguar", name: "Jaguar", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Jaguar_F-Pace/front.jpg", url: "https://www.carcarekiosk.com/videos/Jaguar" },
    { id: "jeep", name: "Jeep", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Jeep_Compass/front.jpg", url: "https://www.carcarekiosk.com/videos/Jeep" },
    { id: "kia", name: "Kia", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Kia_Sportage/front.jpg", url: "https://www.carcarekiosk.com/videos/Kia" },
    { id: "lada", name: "Lada", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Lada_Vesta/front.jpg", url: "https://www.carcarekiosk.com/videos/Lada" },
    { id: "lancia", name: "Lancia", image: "https://www.carcarekiosk.com/imager/vehicles/2012_Lancia_Ypsilon/front.jpg", url: "https://www.carcarekiosk.com/videos/Lancia" },
    { id: "land-rover", name: "Land Rover", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Land_Rover_Discovery/front.jpg", url: "https://www.carcarekiosk.com/videos/Land-Rover" },
    { id: "lexus", name: "Lexus", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Lexus_RX_350/front.jpg", url: "https://www.carcarekiosk.com/videos/Lexus" },
    { id: "lincoln", name: "Lincoln", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Lincoln_MKC/front.jpg", url: "https://www.carcarekiosk.com/videos/Lincoln" },
    { id: "mazda", name: "Mazda", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mazda_CX-5/front.jpg", url: "https://www.carcarekiosk.com/videos/Mazda" },
    { id: "mercedes-benz", name: "Mercedes-Benz", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mercedes-Benz_GLC/front.jpg", url: "https://www.carcarekiosk.com/videos/Mercedes-Benz" },
    { id: "mercury", name: "Mercury", image: "https://www.carcarekiosk.com/imager/vehicles/2010_Mercury_Milan/front.jpg", url: "https://www.carcarekiosk.com/videos/Mercury" },
    { id: "mini", name: "MINI", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mini_Countryman/front.jpg", url: "https://www.carcarekiosk.com/videos/Mini" },
    { id: "mitsubishi", name: "Mitsubishi", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mitsubishi_Outlander/front.jpg", url: "https://www.carcarekiosk.com/videos/Mitsubishi" },
    { id: "nissan", name: "Nissan", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Nissan_Rogue/front.jpg", url: "https://www.carcarekiosk.com/videos/Nissan" },
    { id: "oldsmobile", name: "Oldsmobile", image: "https://www.carcarekiosk.com/imager/vehicles/2002_Oldsmobile_Alero/front.jpg", url: "https://www.carcarekiosk.com/videos/Oldsmobile" },
    { id: "opel", name: "Opel", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Opel_Corsa/front.jpg", url: "https://www.carcarekiosk.com/videos/Opel" },
    { id: "peugeot", name: "Peugeot", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Peugeot_308/front.jpg", url: "https://www.carcarekiosk.com/videos/Peugeot" },
    { id: "plymouth", name: "Plymouth", image: "https://www.carcarekiosk.com/imager/vehicles/2000_Plymouth_Voyager/front.jpg", url: "https://www.carcarekiosk.com/videos/Plymouth" },
    { id: "pontiac", name: "Pontiac", image: "https://www.carcarekiosk.com/imager/vehicles/2008_Pontiac_G6/front.jpg", url: "https://www.carcarekiosk.com/videos/Pontiac" },
    { id: "porsche", name: "Porsche", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Porsche_Cayenne/front.jpg", url: "https://www.carcarekiosk.com/videos/Porsche" },
    { id: "ram", name: "Ram", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Ram_1500/front.jpg", url: "https://www.carcarekiosk.com/videos/Ram" },
    { id: "renault", name: "Renault", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Renault_Duster/front.jpg", url: "https://www.carcarekiosk.com/videos/Renault" },
    { id: "saab", name: "Saab", image: "https://www.carcarekiosk.com/imager/vehicles/2010_Saab_9-3/front.jpg", url: "https://www.carcarekiosk.com/videos/Saab" },
    { id: "saturn", name: "Saturn", image: "https://www.carcarekiosk.com/imager/vehicles/2008_Saturn_Vue/front.jpg", url: "https://www.carcarekiosk.com/videos/Saturn" },
    { id: "scion", name: "Scion", image: "https://www.carcarekiosk.com/imager/vehicles/2015_Scion_tC/front.jpg", url: "https://www.carcarekiosk.com/videos/Scion" },
    { id: "seat", name: "SEAT", image: "https://www.carcarekiosk.com/imager/vehicles/2019_SEAT_Leon/front.jpg", url: "https://www.carcarekiosk.com/videos/SEAT" },
    { id: "skoda", name: "Skoda", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Skoda_Octavia/front.jpg", url: "https://www.carcarekiosk.com/videos/Skoda" },
    { id: "smart", name: "Smart", image: "https://www.carcarekiosk.com/imager/vehicles/2016_Smart_Fortwo/front.jpg", url: "https://www.carcarekiosk.com/videos/Smart" },
    { id: "subaru", name: "Subaru", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Subaru_Outback/front.jpg", url: "https://www.carcarekiosk.com/videos/Subaru" },
    { id: "suzuki", name: "Suzuki", image: "https://www.carcarekiosk.com/imager/vehicles/2013_Suzuki_SX4/front.jpg", url: "https://www.carcarekiosk.com/videos/Suzuki" },
    { id: "tesla", name: "Tesla", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Tesla_Model_3/front.jpg", url: "https://www.carcarekiosk.com/videos/Tesla" },
    { id: "toyota", name: "Toyota", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Toyota_RAV4/front.jpg", url: "https://www.carcarekiosk.com/videos/Toyota" },
    { id: "volkswagen", name: "Volkswagen", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Volkswagen_Tiguan/front.jpg", url: "https://www.carcarekiosk.com/videos/Volkswagen" },
    { id: "volvo", name: "Volvo", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Volvo_XC60/front.jpg", url: "https://www.carcarekiosk.com/videos/Volvo" },
  ];
}

// Dados completos de modelos por marca - 1.357 modelos do CarCareKiosk
function getStaticModels(brand: string): any[] {
  const brandLower = brand.toLowerCase().replace(/\s+/g, "-");
  const models = STATIC_MODELS_DATA[brandLower] || [];
  return models.sort((a, b) => {
    const yearDiff = parseInt(b.years) - parseInt(a.years);
    if (yearDiff !== 0) return yearDiff;
    return a.name.localeCompare(b.name);
  });
}

// Helper para criar entrada de modelo
function m(year: string, model: string, brand: string): any {
  const brandSlug = brand.replace(/\s+/g, "_");
  const modelSlug = model.replace(/\s+/g, "_").replace(/-/g, "_");
  return {
    id: `${year}_${brandSlug}_${modelSlug}`,
    name: model,
    years: year,
    image: `https://www.carcarekiosk.com/imager/vehicles/${year}_${brandSlug}_${modelSlug}/front.jpg`,
    url: `https://www.carcarekiosk.com/video/${year}_${brandSlug}_${modelSlug}`,
  };
}

const STATIC_MODELS_DATA: Record<string, any[]> = {
  // ACURA - 24 modelos
  "acura": [
    m("2019", "ILX", "Acura"), m("2017", "ILX", "Acura"), m("2015", "ILX", "Acura"), m("2013", "ILX", "Acura"),
    m("2023", "Integra", "Acura"), m("2019", "MDX", "Acura"), m("2016", "MDX", "Acura"), m("2012", "MDX", "Acura"),
    m("2007", "MDX", "Acura"), m("2005", "MDX", "Acura"), m("2020", "RDX", "Acura"), m("2017", "RDX", "Acura"),
    m("2013", "RDX", "Acura"), m("2009", "RDX", "Acura"), m("2002", "RSX", "Acura"), m("2009", "TL", "Acura"),
    m("2007", "TL", "Acura"), m("2004", "TL", "Acura"), m("2012", "TL", "Acura"), m("2011", "TSX", "Acura"),
    m("2010", "TSX", "Acura"), m("2004", "TSX", "Acura"), m("2018", "TLX", "Acura"), m("2015", "TLX", "Acura"),
  ],

  // ALFA ROMEO - 5 modelos
  "alfa-romeo": [
    m("2018", "Giulia", "Alfa_Romeo"), m("2018", "Stelvio", "Alfa_Romeo"), m("2001", "156", "Alfa_Romeo"),
    m("2002", "147", "Alfa_Romeo"), m("1994", "164", "Alfa_Romeo"),
  ],

  // AUDI - 41 modelos
  "audi": [
    m("1999", "A3", "Audi"), m("2003", "A3", "Audi"), m("2006", "A3", "Audi"), m("2008", "A3", "Audi"),
    m("2015", "A3", "Audi"), m("2000", "A4", "Audi"), m("2002", "A4", "Audi"), m("2005", "A4", "Audi"),
    m("2007", "A4", "Audi"), m("2010", "A4", "Audi"), m("2012", "A4", "Audi"), m("2017", "A4", "Audi"),
    m("2018", "A4", "Audi"), m("2014", "A5", "Audi"), m("2012", "A5", "Audi"), m("2003", "A6", "Audi"),
    m("2008", "A6", "Audi"), m("2013", "A6", "Audi"), m("2001", "A8", "Audi"), m("2004", "A8", "Audi"),
    m("2008", "A8", "Audi"), m("2017", "Q3", "Audi"), m("2018", "Q5", "Audi"), m("2013", "Q5", "Audi"),
    m("2010", "Q5", "Audi"), m("2014", "Q7", "Audi"), m("2007", "Q7", "Audi"), m("2019", "Q8", "Audi"),
    m("2008", "R8", "Audi"), m("2004", "S4", "Audi"), m("2002", "S6", "Audi"), m("2010", "S4", "Audi"),
    m("2000", "TT", "Audi"), m("2004", "TT", "Audi"), m("2008", "TT", "Audi"), m("2004", "Allroad", "Audi"),
    m("2015", "Allroad", "Audi"), m("2014", "RS 5", "Audi"), m("2010", "S5", "Audi"), m("2014", "SQ5", "Audi"),
    m("2018", "SQ5", "Audi"),
  ],

  // BMW - 45 modelos
  "bmw": [
    m("2006", "325i", "BMW"), m("2011", "335i", "BMW"), m("2011", "328i", "BMW"), m("2013", "328i", "BMW"),
    m("2009", "328i", "BMW"), m("2001", "325i", "BMW"), m("2014", "328i xDrive", "BMW"), m("2017", "330i", "BMW"),
    m("2021", "330i", "BMW"), m("2008", "335i", "BMW"), m("2016", "340i", "BMW"), m("2015", "428i", "BMW"),
    m("2008", "535i", "BMW"), m("2001", "525i", "BMW"), m("2006", "525i", "BMW"), m("2012", "528i", "BMW"),
    m("2014", "535i", "BMW"), m("2016", "535i", "BMW"), m("2010", "550i", "BMW"), m("2019", "540i", "BMW"),
    m("2002", "530i", "BMW"), m("2004", "530i", "BMW"), m("2002", "745i", "BMW"), m("2006", "750i", "BMW"),
    m("2011", "740i", "BMW"), m("2016", "740i", "BMW"), m("2004", "X3", "BMW"), m("2008", "X3", "BMW"),
    m("2014", "X3", "BMW"), m("2018", "X3", "BMW"), m("2013", "X1", "BMW"), m("2019", "X1", "BMW"),
    m("2010", "X5", "BMW"), m("2012", "X5", "BMW"), m("2015", "X5", "BMW"), m("2006", "X5", "BMW"),
    m("2018", "X5", "BMW"), m("2011", "X6", "BMW"), m("2019", "X7", "BMW"), m("2009", "Z4", "BMW"),
    m("2014", "Z4", "BMW"), m("2008", "M3", "BMW"), m("2010", "M3", "BMW"), m("2011", "M5", "BMW"),
    m("2016", "M4", "BMW"),
  ],

  // BUICK - 24 modelos
  "buick": [
    m("2020", "Enclave", "Buick"), m("2018", "Enclave", "Buick"), m("2011", "Enclave", "Buick"), m("2008", "Enclave", "Buick"),
    m("2015", "Encore", "Buick"), m("2019", "Encore", "Buick"), m("2017", "Envision", "Buick"), m("2012", "Verano", "Buick"),
    m("2010", "LaCrosse", "Buick"), m("2012", "LaCrosse", "Buick"), m("2017", "LaCrosse", "Buick"), m("2004", "LeSabre", "Buick"),
    m("2008", "Lucerne", "Buick"), m("2003", "Park Avenue", "Buick"), m("2013", "Regal", "Buick"), m("2008", "Regal", "Buick"),
    m("2003", "Regal", "Buick"), m("2004", "Rainier", "Buick"), m("2002", "Rendezvous", "Buick"), m("2005", "Rendezvous", "Buick"),
    m("2006", "Rendezvous", "Buick"), m("2003", "Century", "Buick"), m("2004", "Century", "Buick"), m("2008", "Allure", "Buick"),
  ],

  // CADILLAC - 31 modelos
  "cadillac": [
    m("2007", "CTS", "Cadillac"), m("2010", "CTS", "Cadillac"), m("2012", "CTS", "Cadillac"), m("2015", "CTS", "Cadillac"),
    m("2004", "CTS", "Cadillac"), m("2008", "DTS", "Cadillac"), m("2006", "DTS", "Cadillac"), m("2002", "Escalade", "Cadillac"),
    m("2007", "Escalade", "Cadillac"), m("2011", "Escalade", "Cadillac"), m("2013", "Escalade", "Cadillac"), m("2015", "Escalade", "Cadillac"),
    m("2021", "Escalade", "Cadillac"), m("2010", "Escalade ESV", "Cadillac"), m("2015", "Escalade ESV", "Cadillac"),
    m("2005", "STS", "Cadillac"), m("2006", "STS", "Cadillac"), m("2008", "STS", "Cadillac"), m("2003", "Seville", "Cadillac"),
    m("2010", "SRX", "Cadillac"), m("2013", "SRX", "Cadillac"), m("2015", "SRX", "Cadillac"), m("2005", "SRX", "Cadillac"),
    m("2015", "ATS", "Cadillac"), m("2017", "ATS", "Cadillac"), m("2018", "CT6", "Cadillac"), m("2019", "XT4", "Cadillac"),
    m("2018", "XT5", "Cadillac"), m("2020", "XT5", "Cadillac"), m("2014", "XTS", "Cadillac"), m("2002", "DeVille", "Cadillac"),
  ],

  // CHEVROLET - 91 modelos
  "chevrolet": [
    m("2007", "Avalanche", "Chevrolet"), m("2006", "Aveo", "Chevrolet"), m("2009", "Aveo", "Chevrolet"), m("2005", "Aveo", "Chevrolet"),
    m("2019", "Blazer", "Chevrolet"), m("2000", "Blazer", "Chevrolet"), m("2002", "Camaro", "Chevrolet"), m("2015", "Camaro", "Chevrolet"),
    m("2018", "Camaro", "Chevrolet"), m("2002", "Cavalier", "Chevrolet"), m("1997", "Cavalier", "Chevrolet"), m("2022", "Colorado", "Chevrolet"),
    m("2019", "Colorado", "Chevrolet"), m("2015", "Colorado", "Chevrolet"), m("2010", "Colorado", "Chevrolet"), m("2007", "Colorado", "Chevrolet"),
    m("2004", "Colorado", "Chevrolet"), m("2005", "Cobalt", "Chevrolet"), m("2008", "Cobalt", "Chevrolet"), m("2009", "Cobalt", "Chevrolet"),
    m("2013", "Cruze", "Chevrolet"), m("2011", "Cruze", "Chevrolet"), m("2016", "Cruze", "Chevrolet"), m("2018", "Cruze", "Chevrolet"),
    m("2021", "Equinox", "Chevrolet"), m("2018", "Equinox", "Chevrolet"), m("2015", "Equinox", "Chevrolet"), m("2014", "Equinox", "Chevrolet"),
    m("2012", "Equinox", "Chevrolet"), m("2010", "Equinox", "Chevrolet"), m("2009", "Equinox", "Chevrolet"), m("2005", "Equinox", "Chevrolet"),
    m("2005", "Express 1500", "Chevrolet"), m("2012", "Express 2500", "Chevrolet"), m("2010", "Express 3500", "Chevrolet"),
    m("2007", "HHR", "Chevrolet"), m("2011", "HHR", "Chevrolet"), m("2005", "Impala", "Chevrolet"), m("2006", "Impala", "Chevrolet"),
    m("2010", "Impala", "Chevrolet"), m("2014", "Impala", "Chevrolet"), m("2018", "Impala", "Chevrolet"), m("2000", "Impala", "Chevrolet"),
    m("2008", "Malibu", "Chevrolet"), m("2009", "Malibu", "Chevrolet"), m("2013", "Malibu", "Chevrolet"), m("2015", "Malibu", "Chevrolet"),
    m("2017", "Malibu", "Chevrolet"), m("2000", "Malibu", "Chevrolet"), m("2002", "Malibu", "Chevrolet"), m("2005", "Malibu", "Chevrolet"),
    m("2006", "Monte Carlo", "Chevrolet"), m("2002", "Monte Carlo", "Chevrolet"), m("2016", "Silverado 1500", "Chevrolet"),
    m("2018", "Silverado 1500", "Chevrolet"), m("2008", "Silverado 1500", "Chevrolet"), m("2005", "Silverado 1500", "Chevrolet"),
    m("2012", "Silverado 1500", "Chevrolet"), m("2001", "Silverado 1500", "Chevrolet"), m("2010", "Silverado 2500 HD", "Chevrolet"),
    m("2016", "Silverado 2500 HD", "Chevrolet"), m("2015", "Silverado 3500 HD", "Chevrolet"), m("2017", "Silverado 3500 HD", "Chevrolet"),
    m("2016", "Sonic", "Chevrolet"), m("2014", "Sonic", "Chevrolet"), m("2013", "Spark", "Chevrolet"), m("2016", "Spark", "Chevrolet"),
    m("2020", "Spark", "Chevrolet"), m("2008", "Suburban", "Chevrolet"), m("2015", "Suburban", "Chevrolet"), m("2018", "Suburban", "Chevrolet"),
    m("2021", "Suburban", "Chevrolet"), m("2016", "Tahoe", "Chevrolet"), m("2013", "Tahoe", "Chevrolet"), m("2010", "Tahoe", "Chevrolet"),
    m("2007", "Tahoe", "Chevrolet"), m("2003", "Tahoe", "Chevrolet"), m("2000", "Tahoe", "Chevrolet"), m("2018", "Tahoe", "Chevrolet"),
    m("2002", "TrailBlazer", "Chevrolet"), m("2006", "TrailBlazer", "Chevrolet"), m("2008", "TrailBlazer", "Chevrolet"),
    m("2021", "Trailblazer", "Chevrolet"), m("2018", "Traverse", "Chevrolet"), m("2014", "Traverse", "Chevrolet"), m("2009", "Traverse", "Chevrolet"),
    m("2021", "Traverse", "Chevrolet"), m("2015", "Trax", "Chevrolet"), m("2018", "Trax", "Chevrolet"), m("2007", "Uplander", "Chevrolet"),
    m("2000", "Venture", "Chevrolet"), m("2016", "Volt", "Chevrolet"),
  ],

  // CHRYSLER - 21 modelos
  "chrysler": [
    m("2008", "300", "Chrysler"), m("2014", "300", "Chrysler"), m("2005", "300", "Chrysler"), m("2011", "300", "Chrysler"),
    m("2013", "300", "Chrysler"), m("2015", "300", "Chrysler"), m("2017", "300", "Chrysler"), m("2005", "Crossfire", "Chrysler"),
    m("2006", "Sebring", "Chrysler"), m("2008", "Sebring", "Chrysler"), m("2003", "Sebring", "Chrysler"), m("2010", "Sebring", "Chrysler"),
    m("2007", "Aspen", "Chrysler"), m("2004", "Pacifica", "Chrysler"), m("2017", "Pacifica", "Chrysler"), m("2019", "Pacifica", "Chrysler"),
    m("2002", "Voyager", "Chrysler"), m("2001", "PT Cruiser", "Chrysler"), m("2005", "PT Cruiser", "Chrysler"),
    m("2008", "Town & Country", "Chrysler"), m("2014", "Town & Country", "Chrysler"),
  ],

  // CITROEN - 14 modelos
  "citroen": [
    m("2004", "C2", "Citroen"), m("2017", "C3", "Citroen"), m("2010", "C3", "Citroen"), m("2004", "C3", "Citroen"),
    m("2008", "C4", "Citroen"), m("2018", "C4 Cactus", "Citroen"), m("2009", "C5", "Citroen"), m("2005", "C5", "Citroen"),
    m("2019", "C-Elysee", "Citroen"), m("2006", "Xsara Picasso", "Citroen"), m("2003", "Berlingo", "Citroen"),
    m("2000", "Saxo", "Citroen"), m("1996", "ZX", "Citroen"), m("1991", "XM", "Citroen"),
  ],

  // DACIA - 6 modelos
  "dacia": [
    m("2018", "Duster", "Dacia"), m("2016", "Sandero Stepway", "Dacia"), m("2020", "Logan", "Dacia"),
    m("2013", "Dokker", "Dacia"), m("2015", "Lodgy", "Dacia"), m("2012", "Sandero", "Dacia"),
  ],

  // DAEWOO - 3 modelos
  "daewoo": [
    m("2002", "Lanos", "Daewoo"), m("2000", "Nubira", "Daewoo"), m("1999", "Leganza", "Daewoo"),
  ],

  // DODGE - 40 modelos
  "dodge": [
    m("1998", "Avenger", "Dodge"), m("2010", "Avenger", "Dodge"), m("2008", "Avenger", "Dodge"), m("2012", "Avenger", "Dodge"),
    m("2007", "Caliber", "Dodge"), m("2011", "Caliber", "Dodge"), m("2015", "Challenger", "Dodge"), m("2017", "Challenger", "Dodge"),
    m("2019", "Challenger", "Dodge"), m("2009", "Challenger", "Dodge"), m("2008", "Charger", "Dodge"), m("2012", "Charger", "Dodge"),
    m("2015", "Charger", "Dodge"), m("2014", "Charger", "Dodge"), m("2019", "Charger", "Dodge"), m("2006", "Charger", "Dodge"),
    m("2017", "Charger", "Dodge"), m("2000", "Dakota", "Dodge"), m("2006", "Dakota", "Dodge"), m("2008", "Dakota", "Dodge"),
    m("2015", "Dart", "Dodge"), m("2013", "Dart", "Dodge"), m("2015", "Durango", "Dodge"), m("2017", "Durango", "Dodge"),
    m("2013", "Durango", "Dodge"), m("2007", "Durango", "Dodge"), m("2011", "Durango", "Dodge"), m("2001", "Durango", "Dodge"),
    m("2005", "Durango", "Dodge"), m("2008", "Grand Caravan", "Dodge"), m("2012", "Grand Caravan", "Dodge"), m("2013", "Grand Caravan", "Dodge"),
    m("2015", "Grand Caravan", "Dodge"), m("2016", "Grand Caravan", "Dodge"), m("2017", "Grand Caravan", "Dodge"), m("2005", "Grand Caravan", "Dodge"),
    m("2016", "Journey", "Dodge"), m("2009", "Journey", "Dodge"), m("2013", "Journey", "Dodge"), m("2007", "Nitro", "Dodge"),
  ],

  // FIAT - 16 modelos
  "fiat": [
    m("2012", "500", "Fiat"), m("2013", "500", "Fiat"), m("2015", "500", "Fiat"), m("2017", "500", "Fiat"),
    m("2016", "500X", "Fiat"), m("2021", "500X", "Fiat"), m("2009", "Bravo", "Fiat"), m("2002", "Doblo", "Fiat"),
    m("2020", "Ducato", "Fiat"), m("2014", "Panda", "Fiat"), m("2006", "Punto", "Fiat"), m("1996", "Punto", "Fiat"),
    m("2015", "Qubo", "Fiat"), m("2000", "Seicento", "Fiat"), m("2006", "Stilo", "Fiat"), m("2015", "Tipo", "Fiat"),
  ],

  // FORD - 74 modelos
  "ford": [
    m("2000", "Contour", "Ford"), m("2016", "C-Max", "Ford"), m("2018", "Ecosport", "Ford"), m("2019", "Ecosport", "Ford"),
    m("2017", "Edge", "Ford"), m("2015", "Edge", "Ford"), m("2013", "Edge", "Ford"), m("2009", "Edge", "Ford"),
    m("2021", "Bronco", "Ford"), m("2021", "Bronco Sport", "Ford"), m("2002", "Escape", "Ford"), m("2008", "Escape", "Ford"),
    m("2009", "Escape", "Ford"), m("2010", "Escape", "Ford"), m("2014", "Escape", "Ford"), m("2015", "Escape", "Ford"),
    m("2017", "Escape", "Ford"), m("2020", "Escape", "Ford"), m("2001", "Escape", "Ford"), m("2005", "Escape", "Ford"),
    m("2006", "Escape", "Ford"), m("2011", "Escape", "Ford"), m("2001", "Excursion", "Ford"), m("2004", "Excursion", "Ford"),
    m("2019", "Expedition", "Ford"), m("2015", "Expedition", "Ford"), m("2011", "Expedition", "Ford"), m("2004", "Expedition", "Ford"),
    m("2008", "Expedition", "Ford"), m("2005", "Expedition", "Ford"), m("2000", "Expedition", "Ford"), m("2010", "Explorer", "Ford"),
    m("2015", "Explorer", "Ford"), m("2013", "Explorer", "Ford"), m("2005", "Explorer", "Ford"), m("2008", "Explorer", "Ford"),
    m("2002", "Explorer", "Ford"), m("2017", "Explorer", "Ford"), m("2006", "Explorer", "Ford"), m("2021", "Explorer", "Ford"),
    m("2011", "Fiesta", "Ford"), m("2017", "Fiesta", "Ford"), m("2002", "Fiesta", "Ford"), m("2009", "Flex", "Ford"),
    m("2013", "Flex", "Ford"), m("2017", "Flex", "Ford"), m("2004", "Focus", "Ford"), m("2007", "Focus", "Ford"),
    m("2011", "Focus", "Ford"), m("2012", "Focus", "Ford"), m("2018", "Focus", "Ford"), m("2008", "Focus", "Ford"),
    m("2000", "Focus", "Ford"), m("2002", "Focus", "Ford"), m("2006", "Freestar", "Ford"), m("2018", "Fusion", "Ford"),
    m("2013", "Fusion", "Ford"), m("2010", "Fusion", "Ford"), m("2012", "Fusion", "Ford"), m("2017", "Fusion", "Ford"),
    m("2006", "Fusion", "Ford"), m("2007", "Fusion", "Ford"), m("2016", "Fusion", "Ford"), m("2014", "Fusion", "Ford"),
    m("2008", "F-150", "Ford"), m("2011", "F-150", "Ford"), m("2015", "F-150", "Ford"), m("2017", "F-150", "Ford"),
    m("2004", "F-150", "Ford"), m("2010", "F-150", "Ford"), m("2022", "F-150", "Ford"), m("2012", "F-250 Super Duty", "Ford"),
    m("2017", "F-250 Super Duty", "Ford"), m("2005", "F-250 Super Duty", "Ford"),
  ],

  // GENESIS - 2 modelos
  "genesis": [
    m("2022", "G70", "Genesis"), m("2019", "G80", "Genesis"),
  ],

  // GMC - 27 modelos
  "gmc": [
    m("2016", "Acadia", "GMC"), m("2011", "Acadia", "GMC"), m("2017", "Acadia", "GMC"), m("2010", "Acadia", "GMC"),
    m("2007", "Acadia", "GMC"), m("2019", "Acadia", "GMC"), m("2021", "Acadia", "GMC"), m("2020", "Canyon", "GMC"),
    m("2016", "Canyon", "GMC"), m("2004", "Canyon", "GMC"), m("2003", "Envoy", "GMC"), m("2006", "Envoy", "GMC"),
    m("2007", "Envoy", "GMC"), m("2008", "Savana 2500", "GMC"), m("2010", "Savana 2500", "GMC"), m("2009", "Savana 3500", "GMC"),
    m("2017", "Sierra 1500", "GMC"), m("2015", "Sierra 1500", "GMC"), m("2010", "Sierra 1500", "GMC"), m("2008", "Sierra 1500", "GMC"),
    m("2005", "Sierra 1500", "GMC"), m("2011", "Sierra 2500 HD", "GMC"), m("2016", "Sierra 2500 HD", "GMC"),
    m("2017", "Terrain", "GMC"), m("2014", "Terrain", "GMC"), m("2012", "Terrain", "GMC"), m("2011", "Terrain", "GMC"),
  ],

  // HONDA - 57 modelos
  "honda": [
    m("2024", "Accord", "Honda"), m("2019", "Accord", "Honda"), m("2018", "Accord", "Honda"), m("2016", "Accord", "Honda"),
    m("2014", "Accord", "Honda"), m("2010", "Accord", "Honda"), m("2009", "Accord", "Honda"), m("2008", "Accord", "Honda"),
    m("2006", "Accord", "Honda"), m("2005", "Accord", "Honda"), m("2003", "Accord", "Honda"), m("2000", "Accord", "Honda"),
    m("1998", "Accord", "Honda"), m("2022", "Civic", "Honda"), m("2019", "Civic", "Honda"), m("2017", "Civic", "Honda"),
    m("2015", "Civic", "Honda"), m("2014", "Civic", "Honda"), m("2012", "Civic", "Honda"), m("2010", "Civic", "Honda"),
    m("2009", "Civic", "Honda"), m("2008", "Civic", "Honda"), m("2006", "Civic", "Honda"), m("2005", "Civic", "Honda"),
    m("2003", "Civic", "Honda"), m("2002", "Civic", "Honda"), m("2001", "Civic", "Honda"), m("1997", "Civic", "Honda"),
    m("2022", "CR-V", "Honda"), m("2020", "CR-V", "Honda"), m("2018", "CR-V", "Honda"), m("2016", "CR-V", "Honda"),
    m("2015", "CR-V", "Honda"), m("2014", "CR-V", "Honda"), m("2012", "CR-V", "Honda"), m("2010", "CR-V", "Honda"),
    m("2008", "CR-V", "Honda"), m("2006", "CR-V", "Honda"), m("2005", "CR-V", "Honda"), m("2003", "CR-V", "Honda"),
    m("2000", "CR-V", "Honda"), m("1999", "CR-V", "Honda"), m("2004", "Element", "Honda"), m("2008", "Element", "Honda"),
    m("2010", "Element", "Honda"), m("2011", "Fit", "Honda"), m("2013", "Fit", "Honda"), m("2015", "Fit", "Honda"),
    m("2019", "HR-V", "Honda"), m("2016", "HR-V", "Honda"), m("2015", "Odyssey", "Honda"), m("2012", "Odyssey", "Honda"),
    m("2007", "Odyssey", "Honda"), m("2005", "Odyssey", "Honda"), m("2019", "Passport", "Honda"), m("2016", "Pilot", "Honda"),
    m("2012", "Pilot", "Honda"),
  ],

  // HUMMER - 4 modelos
  "hummer": [
    m("2006", "H3", "Hummer"), m("2008", "H3", "Hummer"), m("2006", "H2", "Hummer"), m("2003", "H2", "Hummer"),
  ],

  // HYUNDAI - 42 modelos
  "hyundai": [
    m("2008", "Accent", "Hyundai"), m("2012", "Accent", "Hyundai"), m("2015", "Accent", "Hyundai"), m("2018", "Accent", "Hyundai"),
    m("2000", "Accent", "Hyundai"), m("2006", "Azera", "Hyundai"), m("2008", "Elantra", "Hyundai"), m("2010", "Elantra", "Hyundai"),
    m("2013", "Elantra", "Hyundai"), m("2015", "Elantra", "Hyundai"), m("2018", "Elantra", "Hyundai"), m("2021", "Elantra", "Hyundai"),
    m("2017", "Elantra GT", "Hyundai"), m("2005", "Elantra", "Hyundai"), m("2002", "Elantra", "Hyundai"), m("2010", "Genesis Coupe", "Hyundai"),
    m("2015", "Genesis", "Hyundai"), m("2018", "Ioniq", "Hyundai"), m("2019", "Ioniq", "Hyundai"), m("2019", "Kona", "Hyundai"),
    m("2022", "Palisade", "Hyundai"), m("2020", "Palisade", "Hyundai"), m("2013", "Santa Fe", "Hyundai"), m("2009", "Santa Fe", "Hyundai"),
    m("2017", "Santa Fe", "Hyundai"), m("2019", "Santa Fe", "Hyundai"), m("2021", "Santa Fe", "Hyundai"), m("2006", "Santa Fe", "Hyundai"),
    m("2003", "Santa Fe", "Hyundai"), m("2008", "Sonata", "Hyundai"), m("2007", "Sonata", "Hyundai"), m("2009", "Sonata", "Hyundai"),
    m("2011", "Sonata", "Hyundai"), m("2015", "Sonata", "Hyundai"), m("2018", "Sonata", "Hyundai"), m("2020", "Sonata", "Hyundai"),
    m("2005", "Sonata", "Hyundai"), m("2001", "Sonata", "Hyundai"), m("2010", "Tucson", "Hyundai"), m("2016", "Tucson", "Hyundai"),
    m("2019", "Tucson", "Hyundai"), m("2022", "Tucson", "Hyundai"),
  ],

  // INFINITI - 21 modelos
  "infiniti": [
    m("2014", "Q50", "Infiniti"), m("2018", "Q50", "Infiniti"), m("2016", "Q50", "Infiniti"), m("2012", "G37", "Infiniti"),
    m("2010", "G37", "Infiniti"), m("2008", "G35", "Infiniti"), m("2004", "G35", "Infiniti"), m("2013", "JX35", "Infiniti"),
    m("2004", "FX35", "Infiniti"), m("2007", "FX35", "Infiniti"), m("2009", "FX35", "Infiniti"), m("2008", "EX35", "Infiniti"),
    m("2003", "I35", "Infiniti"), m("2002", "I35", "Infiniti"), m("2011", "M37", "Infiniti"), m("2004", "M45", "Infiniti"),
    m("2016", "QX60", "Infiniti"), m("2014", "QX60", "Infiniti"), m("2017", "QX60", "Infiniti"), m("2015", "QX80", "Infiniti"),
    m("2019", "QX80", "Infiniti"),
  ],

  // ISUZU - 6 modelos
  "isuzu": [
    m("2004", "Rodeo", "Isuzu"), m("2001", "Rodeo", "Isuzu"), m("1999", "Rodeo", "Isuzu"), m("1998", "Trooper", "Isuzu"),
    m("2001", "Trooper", "Isuzu"), m("2001", "Vehicross", "Isuzu"),
  ],

  // JAGUAR - 12 modelos
  "jaguar": [
    m("2014", "F-Type", "Jaguar"), m("2017", "F-Type", "Jaguar"), m("2018", "F-Pace", "Jaguar"), m("2020", "F-Pace", "Jaguar"),
    m("2005", "S-Type", "Jaguar"), m("2000", "S-Type", "Jaguar"), m("2006", "X-Type", "Jaguar"), m("2004", "X-Type", "Jaguar"),
    m("2005", "XJ8", "Jaguar"), m("2010", "XF", "Jaguar"), m("2014", "XF", "Jaguar"), m("2017", "XE", "Jaguar"),
  ],

  // JEEP - 35 modelos
  "jeep": [
    m("2016", "Cherokee", "Jeep"), m("2015", "Cherokee", "Jeep"), m("2014", "Cherokee", "Jeep"), m("2019", "Cherokee", "Jeep"),
    m("2001", "Cherokee", "Jeep"), m("1998", "Cherokee", "Jeep"), m("2018", "Compass", "Jeep"), m("2017", "Compass", "Jeep"),
    m("2011", "Compass", "Jeep"), m("2007", "Compass", "Jeep"), m("2009", "Compass", "Jeep"), m("2017", "Grand Cherokee", "Jeep"),
    m("2015", "Grand Cherokee", "Jeep"), m("2012", "Grand Cherokee", "Jeep"), m("2011", "Grand Cherokee", "Jeep"),
    m("2008", "Grand Cherokee", "Jeep"), m("2006", "Grand Cherokee", "Jeep"), m("2005", "Grand Cherokee", "Jeep"),
    m("2000", "Grand Cherokee", "Jeep"), m("2004", "Grand Cherokee", "Jeep"), m("2019", "Grand Cherokee", "Jeep"),
    m("2021", "Grand Cherokee L", "Jeep"), m("2010", "Liberty", "Jeep"), m("2008", "Liberty", "Jeep"), m("2007", "Liberty", "Jeep"),
    m("2006", "Liberty", "Jeep"), m("2004", "Liberty", "Jeep"), m("2002", "Liberty", "Jeep"), m("2008", "Patriot", "Jeep"),
    m("2011", "Patriot", "Jeep"), m("2015", "Patriot", "Jeep"), m("2018", "Renegade", "Jeep"), m("2015", "Renegade", "Jeep"),
    m("2016", "Wrangler", "Jeep"), m("2012", "Wrangler", "Jeep"),
  ],

  // KIA - 31 modelos
  "kia": [
    m("2003", "Amanti", "Kia"), m("2005", "Amanti", "Kia"), m("2011", "Forte", "Kia"), m("2014", "Forte", "Kia"),
    m("2017", "Forte", "Kia"), m("2018", "Forte", "Kia"), m("2010", "Forte", "Kia"), m("2019", "Forte", "Kia"),
    m("2020", "Niro", "Kia"), m("2005", "Optima", "Kia"), m("2007", "Optima", "Kia"), m("2010", "Optima", "Kia"),
    m("2013", "Optima", "Kia"), m("2015", "Optima", "Kia"), m("2016", "Optima", "Kia"), m("2018", "Optima", "Kia"),
    m("2007", "Rio", "Kia"), m("2002", "Rio", "Kia"), m("2010", "Rio", "Kia"), m("2003", "Sedona", "Kia"),
    m("2007", "Sedona", "Kia"), m("2012", "Sedona", "Kia"), m("2019", "Sedona", "Kia"), m("2014", "Sedona", "Kia"),
    m("2008", "Sorento", "Kia"), m("2013", "Sorento", "Kia"), m("2017", "Sorento", "Kia"), m("2011", "Sorento", "Kia"),
    m("2021", "Sorento", "Kia"), m("2008", "Spectra", "Kia"), m("2009", "Sportage", "Kia"),
  ],

  // LADA - 3 modelos
  "lada": [
    m("2019", "Niva", "Lada"), m("2017", "Vesta", "Lada"), m("2018", "Granta", "Lada"),
  ],

  // LANCIA - 4 modelos
  "lancia": [
    m("2008", "Musa", "Lancia"), m("2012", "Ypsilon", "Lancia"), m("1993", "Thema", "Lancia"), m("2002", "Lybra", "Lancia"),
  ],

  // LAND ROVER - 14 modelos
  "land-rover": [
    m("2017", "Discovery", "Land_Rover"), m("2011", "LR4", "Land_Rover"), m("2012", "LR4", "Land_Rover"),
    m("2015", "LR4", "Land_Rover"), m("2010", "LR2", "Land_Rover"), m("2013", "LR2", "Land_Rover"),
    m("2016", "Range Rover Evoque", "Land_Rover"), m("2019", "Range Rover Evoque", "Land_Rover"),
    m("2017", "Range Rover Sport", "Land_Rover"), m("2014", "Range Rover Sport", "Land_Rover"),
    m("2008", "Range Rover Sport", "Land_Rover"), m("2006", "Range Rover Sport", "Land_Rover"),
    m("2004", "Range Rover", "Land_Rover"), m("2003", "Range Rover", "Land_Rover"),
  ],

  // LEXUS - 27 modelos
  "lexus": [
    m("2008", "ES 350", "Lexus"), m("2015", "ES 350", "Lexus"), m("2017", "ES 350", "Lexus"), m("2001", "ES 300", "Lexus"),
    m("2018", "ES 350", "Lexus"), m("2014", "GS 350", "Lexus"), m("2018", "GS 350", "Lexus"), m("2007", "GS 350", "Lexus"),
    m("2001", "GS 300", "Lexus"), m("2019", "GX 460", "Lexus"), m("2015", "GX 460", "Lexus"), m("2010", "GX 460", "Lexus"),
    m("2005", "GX 470", "Lexus"), m("2015", "IS 250", "Lexus"), m("2012", "IS 250", "Lexus"), m("2008", "IS 250", "Lexus"),
    m("2016", "IS 200t", "Lexus"), m("2010", "LS 460", "Lexus"), m("2008", "LS 460", "Lexus"), m("2018", "LX 570", "Lexus"),
    m("2017", "NX 200t", "Lexus"), m("2019", "NX 300", "Lexus"), m("2008", "RX 350", "Lexus"), m("2013", "RX 350", "Lexus"),
    m("2015", "RX 350", "Lexus"), m("2018", "RX 350", "Lexus"), m("2010", "RX 450h", "Lexus"),
  ],

  // LINCOLN - 17 modelos
  "lincoln": [
    m("2017", "Continental", "Lincoln"), m("2020", "Corsair", "Lincoln"), m("2016", "MKC", "Lincoln"), m("2018", "MKC", "Lincoln"),
    m("2015", "MKC", "Lincoln"), m("2011", "MKZ", "Lincoln"), m("2015", "MKZ", "Lincoln"), m("2017", "MKZ", "Lincoln"),
    m("2010", "MKS", "Lincoln"), m("2011", "MKT", "Lincoln"), m("2018", "MKT", "Lincoln"), m("2015", "MKX", "Lincoln"),
    m("2017", "MKX", "Lincoln"), m("2017", "Navigator", "Lincoln"), m("2010", "Navigator", "Lincoln"), m("2005", "Navigator", "Lincoln"),
    m("2002", "Town Car", "Lincoln"),
  ],

  // MAZDA - 30 modelos
  "mazda": [
    m("2012", "2", "Mazda"), m("2019", "3", "Mazda"), m("2014", "3", "Mazda"), m("2011", "3", "Mazda"),
    m("2010", "3", "Mazda"), m("2008", "3", "Mazda"), m("1991", "323", "Mazda"), m("1989", "323", "Mazda"),
    m("2013", "5", "Mazda"), m("2009", "5", "Mazda"), m("2015", "6", "Mazda"), m("2012", "6", "Mazda"),
    m("2010", "6", "Mazda"), m("2006", "6", "Mazda"), m("1998", "626", "Mazda"), m("2004", "B3000", "Mazda"),
    m("2020", "CX-30", "Mazda"), m("2018", "CX-3", "Mazda"), m("2019", "CX-5", "Mazda"), m("2013", "CX-5", "Mazda"),
    m("2011", "CX-7", "Mazda"), m("2008", "CX-7", "Mazda"), m("2016", "CX-9", "Mazda"), m("2009", "CX-9", "Mazda"),
    m("2005", "Miata", "Mazda"), m("2006", "MPV", "Mazda"), m("2016", "MX-5 Miata", "Mazda"), m("2011", "MX-5 Miata", "Mazda"),
    m("2002", "Protege", "Mazda"), m("2006", "Tribute", "Mazda"),
  ],

  // MERCEDES-BENZ - 42 modelos
  "mercedes-benz": [
    m("1989", "190E", "Mercedes-Benz"), m("1983", "200D", "Mercedes-Benz"), m("1981", "380SEL", "Mercedes-Benz"),
    m("1999", "A160", "Mercedes-Benz"), m("2019", "A220", "Mercedes-Benz"), m("2007", "C230", "Mercedes-Benz"),
    m("2003", "C230", "Mercedes-Benz"), m("2007", "C280", "Mercedes-Benz"), m("2015", "C300", "Mercedes-Benz"),
    m("2013", "C300", "Mercedes-Benz"), m("2009", "C300", "Mercedes-Benz"), m("2010", "C63 AMG", "Mercedes-Benz"),
    m("2018", "CLA250", "Mercedes-Benz"), m("2006", "CLK350", "Mercedes-Benz"), m("2007", "CLK550", "Mercedes-Benz"),
    m("2006", "CLS500", "Mercedes-Benz"), m("2007", "CLS63 AMG", "Mercedes-Benz"), m("1995", "E250", "Mercedes-Benz"),
    m("2018", "E300", "Mercedes-Benz"), m("2005", "E320", "Mercedes-Benz"), m("2014", "E350", "Mercedes-Benz"),
    m("2013", "E350", "Mercedes-Benz"), m("2010", "E350", "Mercedes-Benz"), m("2008", "E350", "Mercedes-Benz"),
    m("2006", "E500", "Mercedes-Benz"), m("2014", "E550", "Mercedes-Benz"), m("2010", "E63 AMG", "Mercedes-Benz"),
    m("2013", "GL450", "Mercedes-Benz"), m("2009", "GL450", "Mercedes-Benz"), m("2016", "GLA250", "Mercedes-Benz"),
    m("2020", "GLC300", "Mercedes-Benz"), m("2018", "GLC300", "Mercedes-Benz"), m("2014", "GLK350", "Mercedes-Benz"),
    m("2021", "GLS450", "Mercedes-Benz"), m("2018", "GLS550", "Mercedes-Benz"), m("2019", "Metris", "Mercedes-Benz"),
    m("2007", "ML350", "Mercedes-Benz"), m("2010", "R350", "Mercedes-Benz"), m("2010", "S400", "Mercedes-Benz"),
    m("1998", "SL500", "Mercedes-Benz"), m("2009", "SLK300", "Mercedes-Benz"), m("2011", "Sprinter 2500", "Mercedes-Benz"),
  ],

  // MERCURY - 14 modelos
  "mercury": [
    m("2009", "Grand Marquis", "Mercury"), m("1999", "Grand Marquis", "Mercury"), m("2009", "Mariner", "Mercury"),
    m("2008", "Mariner", "Mercury"), m("2006", "Milan", "Mercury"), m("2005", "Montego", "Mercury"),
    m("2006", "Mountaineer", "Mercury"), m("2005", "Mountaineer", "Mercury"), m("2008", "Sable", "Mercury"),
    m("2005", "Sable", "Mercury"), m("1999", "Sable", "Mercury"), m("1993", "Sable", "Mercury"),
    m("1997", "Tracer", "Mercury"), m("1994", "Tracer", "Mercury"),
  ],

  // MINI - 5 modelos
  "mini": [
    m("2018", "Cooper Countryman", "Mini"), m("2013", "Cooper Countryman", "Mini"), m("2012", "Cooper", "Mini"),
    m("2009", "Cooper", "Mini"), m("2005", "Cooper", "Mini"),
  ],

  // MITSUBISHI - 20 modelos
  "mitsubishi": [
    m("2003", "Colt", "Mitsubishi"), m("2018", "Eclipse Cross", "Mitsubishi"), m("2012", "Eclipse", "Mitsubishi"),
    m("2006", "Eclipse", "Mitsubishi"), m("2005", "Eclipse", "Mitsubishi"), m("1996", "Eclipse", "Mitsubishi"),
    m("2011", "Endeavor", "Mitsubishi"), m("2005", "Galant", "Mitsubishi"), m("2002", "Galant", "Mitsubishi"),
    m("2012", "Lancer", "Mitsubishi"), m("2005", "Lancer", "Mitsubishi"), m("2015", "Mirage", "Mitsubishi"),
    m("1997", "Montero Sport", "Mitsubishi"), m("2019", "Outlander Sport", "Mitsubishi"), m("2013", "Outlander Sport", "Mitsubishi"),
    m("2022", "Outlander", "Mitsubishi"), m("2016", "Outlander", "Mitsubishi"), m("2010", "Outlander", "Mitsubishi"),
    m("2009", "Outlander", "Mitsubishi"), m("2007", "Raider", "Mitsubishi"),
  ],

  // NISSAN - 64 modelos
  "nissan": [
    m("2016", "370Z", "Nissan"), m("2008", "350Z", "Nissan"), m("1999", "Almera", "Nissan"), m("2019", "Altima", "Nissan"),
    m("2017", "Altima", "Nissan"), m("2016", "Altima", "Nissan"), m("2015", "Altima", "Nissan"), m("2014", "Altima", "Nissan"),
    m("2011", "Altima", "Nissan"), m("2009", "Altima", "Nissan"), m("2008", "Altima", "Nissan"), m("2006", "Altima", "Nissan"),
    m("2005", "Altima", "Nissan"), m("1998", "Altima", "Nissan"), m("2017", "Armada", "Nissan"), m("2009", "Armada", "Nissan"),
    m("2011", "Cube", "Nissan"), m("2022", "Frontier", "Nissan"), m("2013", "Frontier", "Nissan"), m("2012", "Frontier", "Nissan"),
    m("2009", "Frontier", "Nissan"), m("2001", "Frontier", "Nissan"), m("2012", "Juke", "Nissan"), m("2019", "Kicks", "Nissan"),
    m("2013", "Leaf", "Nissan"), m("2016", "Maxima", "Nissan"), m("2013", "Maxima", "Nissan"), m("2006", "Maxima", "Nissan"),
    m("2002", "Maxima", "Nissan"), m("2005", "Micra", "Nissan"), m("2015", "Murano", "Nissan"), m("2012", "Murano", "Nissan"),
    m("2004", "Murano", "Nissan"), m("2015", "NV200", "Nissan"), m("2024", "Pathfinder", "Nissan"), m("2018", "Pathfinder", "Nissan"),
    m("2014", "Pathfinder", "Nissan"), m("2013", "Pathfinder", "Nissan"), m("2010", "Pathfinder", "Nissan"),
    m("1993", "Patrol", "Nissan"), m("1995", "Pickup", "Nissan"), m("2015", "Quest", "Nissan"), m("2012", "Quest", "Nissan"),
    m("2007", "Quest", "Nissan"), m("1999", "Quest", "Nissan"), m("2015", "Rogue Select", "Nissan"),
    m("2017", "Rogue Sport", "Nissan"), m("2021", "Rogue", "Nissan"), m("2016", "Rogue", "Nissan"),
    m("2014", "Rogue", "Nissan"), m("2008", "Rogue", "Nissan"), m("2020", "Sentra", "Nissan"), m("2018", "Sentra", "Nissan"),
    m("2016", "Sentra", "Nissan"), m("2013", "Sentra", "Nissan"), m("2008", "Sentra", "Nissan"), m("2006", "Sentra", "Nissan"),
    m("2018", "Titan XD", "Nissan"), m("2017", "Titan XD", "Nissan"), m("2018", "Titan", "Nissan"), m("2013", "Titan", "Nissan"),
    m("2020", "Versa", "Nissan"), m("2015", "Versa Note", "Nissan"), m("2013", "Versa", "Nissan"), m("2008", "Versa", "Nissan"),
    m("2011", "Xterra", "Nissan"),
  ],

  // OLDSMOBILE - 7 modelos
  "oldsmobile": [
    m("1993", "98", "Oldsmobile"), m("2003", "Alero", "Oldsmobile"), m("2001", "Alero", "Oldsmobile"),
    m("2000", "Alero", "Oldsmobile"), m("1997", "Aurora", "Oldsmobile"), m("1996", "Cutlass Ciera", "Oldsmobile"),
    m("1998", "Intrigue", "Oldsmobile"),
  ],

  // OPEL - 18 modelos
  "opel": [
    m("2001", "Agila", "Opel"), m("2018", "Astra", "Opel"), m("1999", "Astra", "Opel"), m("1993", "Astra", "Opel"),
    m("2005", "Combo", "Opel"), m("2018", "Corsa", "Opel"), m("2015", "Corsa", "Opel"), m("2008", "Corsa", "Opel"),
    m("2006", "Corsa", "Opel"), m("1998", "Corsa", "Opel"), m("2018", "Crossland X", "Opel"), m("1990", "Kadett", "Opel"),
    m("2003", "Meriva", "Opel"), m("2000", "Omega", "Opel"), m("2004", "Signum", "Opel"), m("1999", "Tigra", "Opel"),
    m("1998", "Vectra", "Opel"), m("2005", "Zafira", "Opel"), m("2000", "Zafira", "Opel"),
  ],

  // PEUGEOT - 9 modelos
  "peugeot": [
    m("1996", "106", "Peugeot"), m("2008", "107", "Peugeot"), m("1986", "205", "Peugeot"), m("2004", "206", "Peugeot"),
    m("2011", "3008", "Peugeot"), m("2002", "306", "Peugeot"), m("2008", "307", "Peugeot"), m("2000", "406", "Peugeot"),
    m("2005", "407", "Peugeot"),
  ],

  // PLYMOUTH - 2 modelos
  "plymouth": [
    m("1996", "Breeze", "Plymouth"), m("2000", "Voyager", "Plymouth"),
  ],

  // PONTIAC - 20 modelos
  "pontiac": [
    m("2001", "Aztek", "Pontiac"), m("1997", "Bonneville", "Pontiac"), m("2001", "Firebird", "Pontiac"),
    m("1999", "Firebird", "Pontiac"), m("2009", "G3", "Pontiac"), m("2007", "G5", "Pontiac"),
    m("2008", "G6", "Pontiac"), m("2007", "G6", "Pontiac"), m("2009", "G8", "Pontiac"),
    m("2003", "Grand Am", "Pontiac"), m("2007", "Grand Prix", "Pontiac"), m("2003", "Grand Prix", "Pontiac"),
    m("2004", "GTO", "Pontiac"), m("2007", "Solstice", "Pontiac"), m("2005", "Sunfire", "Pontiac"),
    m("2009", "Torrent", "Pontiac"), m("2006", "Torrent", "Pontiac"), m("1998", "Trans Sport", "Pontiac"),
    m("2009", "Vibe", "Pontiac"), m("2008", "Vibe", "Pontiac"),
  ],

  // PORSCHE - 10 modelos
  "porsche": [
    m("2013", "911", "Porsche"), m("2005", "911", "Porsche"), m("2000", "911", "Porsche"), m("1987", "944", "Porsche"),
    m("2012", "Boxster", "Porsche"), m("1998", "Boxster", "Porsche"), m("2022", "Cayenne", "Porsche"),
    m("2013", "Cayenne", "Porsche"), m("2018", "Macan", "Porsche"), m("2010", "Panamera", "Porsche"),
  ],

  // RAM - 9 modelos
  "ram": [
    m("2019", "1500 Classic", "Ram"), m("2019", "1500", "Ram"), m("2015", "1500", "Ram"), m("2014", "1500", "Ram"),
    m("2013", "1500", "Ram"), m("2011", "1500", "Ram"), m("2015", "2500", "Ram"), m("2016", "3500", "Ram"),
    m("2016", "ProMaster 1500", "Ram"),
  ],

  // RENAULT - 11 modelos
  "renault": [
    m("1990", "5", "Renault"), m("2011", "Clio", "Renault"), m("2003", "Clio", "Renault"), m("1992", "Clio", "Renault"),
    m("2001", "Kangoo", "Renault"), m("1997", "Laguna", "Renault"), m("2009", "Megane", "Renault"),
    m("2003", "Megane", "Renault"), m("2000", "Scenic", "Renault"), m("1997", "Twingo", "Renault"),
    m("2002", "Vel Satis", "Renault"),
  ],

  // SAAB - 7 modelos
  "saab": [
    m("2010", "9-3", "Saab"), m("2008", "9-3", "Saab"), m("2004", "9-3", "Saab"), m("2002", "9-3", "Saab"),
    m("2005", "9-5", "Saab"), m("2007", "9-7x", "Saab"), m("1996", "900", "Saab"),
  ],

  // SATURN - 13 modelos
  "saturn": [
    m("2008", "Astra", "Saturn"), m("2009", "Aura", "Saturn"), m("2008", "Aura", "Saturn"),
    m("2003", "Ion-2", "Saturn"), m("2006", "Ion-3", "Saturn"), m("2005", "L300", "Saturn"),
    m("2000", "LS2", "Saturn"), m("2010", "Outlook", "Saturn"), m("2000", "SL", "Saturn"),
    m("2009", "Vue", "Saturn"), m("2008", "Vue", "Saturn"), m("2005", "Vue", "Saturn"), m("2004", "Vue", "Saturn"),
  ],

  // SCION - 10 modelos
  "scion": [
    m("2013", "FR-S", "Scion"), m("2016", "iA", "Scion"), m("2012", "iQ", "Scion"), m("2015", "tC", "Scion"),
    m("2012", "tC", "Scion"), m("2009", "tC", "Scion"), m("2004", "xA", "Scion"), m("2010", "xB", "Scion"),
    m("2006", "xB", "Scion"), m("2008", "xD", "Scion"),
  ],

  // SEAT - 2 modelos
  "seat": [
    m("2002", "Ibiza", "SEAT"), m("1998", "Toledo", "SEAT"),
  ],

  // SKODA - 7 modelos
  "skoda": [
    m("2010", "Fabia", "Skoda"), m("2004", "Fabia", "Skoda"), m("1993", "Favorit", "Skoda"),
    m("1997", "Felicia", "Skoda"), m("2011", "Octavia", "Skoda"), m("2007", "Roomster", "Skoda"),
    m("2012", "Superb", "Skoda"),
  ],

  // SMART - 1 modelo
  "smart": [
    m("2014", "Fortwo", "Smart"),
  ],

  // SUBARU - 40 modelos
  "subaru": [
    m("2019", "Ascent", "Subaru"), m("2006", "B9 Tribeca", "Subaru"), m("2013", "BRZ", "Subaru"),
    m("2018", "Crosstrek", "Subaru"), m("2016", "Crosstrek", "Subaru"), m("2019", "Forester", "Subaru"),
    m("2015", "Forester", "Subaru"), m("2014", "Forester", "Subaru"), m("2011", "Forester", "Subaru"),
    m("2009", "Forester", "Subaru"), m("2006", "Forester", "Subaru"), m("2003", "Forester", "Subaru"),
    m("2017", "Impreza", "Subaru"), m("2013", "Impreza", "Subaru"), m("2012", "Impreza", "Subaru"),
    m("2011", "Impreza", "Subaru"), m("2008", "Impreza", "Subaru"), m("2007", "Impreza", "Subaru"),
    m("2005", "Impreza", "Subaru"), m("1999", "Impreza", "Subaru"), m("2019", "Legacy", "Subaru"),
    m("2015", "Legacy", "Subaru"), m("2011", "Legacy", "Subaru"), m("2010", "Legacy", "Subaru"),
    m("2007", "Legacy", "Subaru"), m("1997", "Legacy", "Subaru"), m("2020", "Outback", "Subaru"),
    m("2016", "Outback", "Subaru"), m("2015", "Outback", "Subaru"), m("2012", "Outback", "Subaru"),
    m("2011", "Outback", "Subaru"), m("2009", "Outback", "Subaru"), m("2002", "Outback", "Subaru"),
    m("2001", "Outback", "Subaru"), m("2016", "WRX STI", "Subaru"), m("2015", "WRX", "Subaru"),
    m("2015", "XV Crosstrek", "Subaru"), m("2014", "XV Crosstrek", "Subaru"),
  ],

  // SUZUKI - 9 modelos
  "suzuki": [
    m("2005", "Forenza", "Suzuki"), m("1999", "Grand Vitara", "Suzuki"), m("2001", "Ignis", "Suzuki"),
    m("2013", "Kizashi", "Suzuki"), m("2002", "Swift", "Suzuki"), m("2013", "SX4", "Suzuki"),
    m("2004", "Verona", "Suzuki"), m("2003", "Wagon", "Suzuki"), m("2003", "XL-7", "Suzuki"),
  ],

  // TESLA - 3 modelos
  "tesla": [
    m("2018", "Model 3", "Tesla"), m("2017", "Model S", "Tesla"), m("2014", "Model S", "Tesla"),
  ],

  // TOYOTA - 106 modelos
  "toyota": [
    m("2018", "4Runner", "Toyota"), m("2015", "4Runner", "Toyota"), m("2013", "4Runner", "Toyota"),
    m("2008", "4Runner", "Toyota"), m("2002", "4Runner", "Toyota"), m("1994", "4Runner", "Toyota"),
    m("2017", "86", "Toyota"), m("2015", "Avalon", "Toyota"), m("2014", "Avalon", "Toyota"),
    m("2011", "Avalon", "Toyota"), m("2008", "Avalon", "Toyota"), m("2000", "Avalon", "Toyota"),
    m("2002", "Avensis", "Toyota"), m("2018", "C-HR", "Toyota"), m("2022", "Camry", "Toyota"),
    m("2020", "Camry", "Toyota"), m("2018", "Camry", "Toyota"), m("2017", "Camry", "Toyota"),
    m("2016", "Camry", "Toyota"), m("2015", "Camry", "Toyota"), m("2014", "Camry", "Toyota"),
    m("2013", "Camry", "Toyota"), m("2012", "Camry", "Toyota"), m("2009", "Camry", "Toyota"),
    m("2008", "Camry", "Toyota"), m("2007", "Camry", "Toyota"), m("2006", "Camry", "Toyota"),
    m("2003", "Camry", "Toyota"), m("2000", "Camry", "Toyota"), m("1998", "Camry", "Toyota"),
    m("1996", "Camry", "Toyota"), m("2001", "Celica", "Toyota"), m("2022", "Corolla Cross", "Toyota"),
    m("2017", "Corolla iM", "Toyota"), m("2023", "Corolla", "Toyota"), m("2021", "Corolla", "Toyota"),
    m("2019", "Corolla", "Toyota"), m("2018", "Corolla", "Toyota"), m("2014", "Corolla", "Toyota"),
    m("2012", "Corolla", "Toyota"), m("2010", "Corolla", "Toyota"), m("2007", "Corolla", "Toyota"),
    m("2004", "Corolla", "Toyota"), m("1999", "Corolla", "Toyota"), m("1996", "Corolla", "Toyota"),
    m("2001", "Echo", "Toyota"), m("2008", "FJ Cruiser", "Toyota"), m("2024", "Grand Highlander", "Toyota"),
    m("2021", "Highlander", "Toyota"), m("2015", "Highlander", "Toyota"), m("2014", "Highlander", "Toyota"),
    m("2013", "Highlander", "Toyota"), m("2012", "Highlander", "Toyota"), m("2009", "Highlander", "Toyota"),
    m("2008", "Highlander", "Toyota"), m("2003", "Highlander", "Toyota"), m("2001", "Highlander", "Toyota"),
    m("2008", "Land Cruiser", "Toyota"), m("2008", "Matrix", "Toyota"), m("2000", "MR2 Spyder", "Toyota"),
    m("2012", "Prius C", "Toyota"), m("2013", "Prius Plug-In", "Toyota"), m("2012", "Prius V", "Toyota"),
    m("2017", "Prius", "Toyota"), m("2010", "Prius", "Toyota"), m("2005", "Prius", "Toyota"),
    m("2021", "RAV4", "Toyota"), m("2019", "RAV4", "Toyota"), m("2018", "RAV4", "Toyota"),
    m("2016", "RAV4", "Toyota"), m("2013", "RAV4", "Toyota"), m("2011", "RAV4", "Toyota"),
    m("2010", "RAV4", "Toyota"), m("2007", "RAV4", "Toyota"), m("2001", "RAV4", "Toyota"),
    m("2000", "RAV4", "Toyota"), m("2020", "Sequoia", "Toyota"), m("2012", "Sequoia", "Toyota"),
    m("2008", "Sequoia", "Toyota"), m("2002", "Sequoia", "Toyota"), m("2022", "Sienna", "Toyota"),
    m("2019", "Sienna", "Toyota"), m("2011", "Sienna", "Toyota"), m("2008", "Sienna", "Toyota"),
    m("2006", "Sienna", "Toyota"), m("1999", "Sienna", "Toyota"), m("2006", "Solara", "Toyota"),
    m("2004", "Solara", "Toyota"), m("2002", "Solara", "Toyota"), m("1996", "T100", "Toyota"),
    m("2017", "Tacoma", "Toyota"), m("2016", "Tacoma", "Toyota"), m("2013", "Tacoma", "Toyota"),
    m("2008", "Tacoma", "Toyota"), m("2001", "Tacoma", "Toyota"), m("2022", "Tundra", "Toyota"),
    m("2015", "Tundra", "Toyota"), m("2012", "Tundra", "Toyota"), m("2010", "Tundra", "Toyota"),
    m("2008", "Tundra", "Toyota"), m("2006", "Tundra", "Toyota"), m("2022", "Venza", "Toyota"),
    m("2016", "Venza", "Toyota"), m("2014", "Venza", "Toyota"), m("2015", "Yaris", "Toyota"),
    m("2012", "Yaris", "Toyota"), m("2011", "Yaris", "Toyota"), m("2003", "Yaris", "Toyota"),
  ],

  // VOLKSWAGEN - 50 modelos
  "volkswagen": [
    m("2018", "Atlas", "Volkswagen"), m("2013", "Beetle", "Volkswagen"), m("2008", "Beetle", "Volkswagen"),
    m("2005", "Beetle", "Volkswagen"), m("1976", "Beetle", "Volkswagen"), m("2002", "Cabrio", "Volkswagen"),
    m("2013", "CC", "Volkswagen"), m("2009", "CC", "Volkswagen"), m("2007", "Fox", "Volkswagen"),
    m("2017", "Golf Alltrack", "Volkswagen"), m("2018", "Golf SportWagen", "Volkswagen"),
    m("2015", "Golf SportWagen", "Volkswagen"), m("2013", "Golf", "Volkswagen"), m("2003", "Golf", "Volkswagen"),
    m("2001", "Golf", "Volkswagen"), m("1997", "Golf", "Volkswagen"), m("1988", "Golf", "Volkswagen"),
    m("1980", "Golf", "Volkswagen"), m("2016", "GTI", "Volkswagen"), m("2012", "GTI", "Volkswagen"),
    m("2019", "Jetta", "Volkswagen"), m("2017", "Jetta", "Volkswagen"), m("2014", "Jetta", "Volkswagen"),
    m("2013", "Jetta", "Volkswagen"), m("2012", "Jetta", "Volkswagen"), m("2011", "Jetta", "Volkswagen"),
    m("2010", "Jetta", "Volkswagen"), m("2009", "Jetta", "Volkswagen"), m("2004", "Jetta", "Volkswagen"),
    m("1999", "Lupo", "Volkswagen"), m("2015", "Passat", "Volkswagen"), m("2014", "Passat", "Volkswagen"),
    m("2013", "Passat", "Volkswagen"), m("2012", "Passat", "Volkswagen"), m("2010", "Passat", "Volkswagen"),
    m("2005", "Passat", "Volkswagen"), m("2004", "Passat", "Volkswagen"), m("1985", "Passat", "Volkswagen"),
    m("2006", "Polo", "Volkswagen"), m("2002", "Polo", "Volkswagen"), m("2000", "Polo", "Volkswagen"),
    m("2008", "Rabbit", "Volkswagen"), m("2009", "Routan", "Volkswagen"), m("2022", "Taos", "Volkswagen"),
    m("2018", "Tiguan", "Volkswagen"), m("2014", "Tiguan", "Volkswagen"), m("2013", "Tiguan", "Volkswagen"),
    m("2011", "Tiguan", "Volkswagen"), m("2006", "Touareg", "Volkswagen"), m("2004", "Touareg", "Volkswagen"),
  ],

  // VOLVO - 19 modelos
  "volvo": [
    m("1992", "740", "Volvo"), m("2008", "C30", "Volvo"), m("2008", "C70", "Volvo"), m("2005", "S40", "Volvo"),
    m("2012", "S60", "Volvo"), m("2008", "S60", "Volvo"), m("2010", "S80", "Volvo"), m("2002", "S80", "Volvo"),
    m("2000", "V40", "Volvo"), m("2007", "V50", "Volvo"), m("2015", "V60", "Volvo"), m("2001", "V70", "Volvo"),
    m("1998", "V70", "Volvo"), m("2021", "XC40", "Volvo"), m("2014", "XC60", "Volvo"), m("2008", "XC70", "Volvo"),
    m("2006", "XC70", "Volvo"), m("2018", "XC90", "Volvo"), m("2008", "XC90", "Volvo"),
  ],
};

// Helper para gerar URL de deep-link do CarCareKiosk
function buildCarCareKioskUrl(year: string, brand: string, model: string, category?: string, procedure?: string): string {
  // Formato: https://www.carcarekiosk.com/video/[Ano]_[Marca]_[Modelo]/[categoria]/[procedimento]
  const brandSlug = brand.replace(/\s+/g, "_");
  const modelSlug = model.replace(/\s+/g, "_").replace(/-/g, "_");
  
  let baseUrl = `https://www.carcarekiosk.com/video/${year}_${brandSlug}_${modelSlug}`;
  
  if (category) {
    baseUrl += `/${category}`;
    if (procedure) {
      baseUrl += `/${procedure}`;
    }
  }
  
  return baseUrl;
}

// Categorias de manutenção padrão com deep-links
function getStaticCategories(brand?: string, model?: string, year?: string): any[] {
  const vehicleContext = `${brand || ""} ${model || ""} ${year || ""}`.trim();
  const yearStr = year || new Date().getFullYear().toString();
  const brandStr = brand || "";
  const modelStr = model || "";
  
  // Mapeamento de categorias para slugs do CarCareKiosk
  const categories = [
    { 
      id: "air_conditioner", 
      name: "Ar Condicionado", 
      nameEn: "Air Conditioner", 
      icon: "❄️",
      procedures: [
        { id: "recharge_freon", name: "Recarregar Gás", nameEn: "Recharge Freon" },
        { id: "fix_minor_leaks", name: "Corrigir Vazamentos", nameEn: "Fix Minor Leaks" },
      ]
    },
    { 
      id: "air_filter_engine", 
      name: "Filtro de Ar (Motor)", 
      nameEn: "Air Filter (Engine)", 
      icon: "🌬️",
      procedures: [
        { id: "replace", name: "Substituir", nameEn: "Replace" },
      ]
    },
    { 
      id: "air_filter_cabin", 
      name: "Filtro de Ar (Cabine)", 
      nameEn: "Cabin Air Filter", 
      icon: "🌬️",
      procedures: [
        { id: "replace", name: "Substituir", nameEn: "Replace" },
      ]
    },
    { 
      id: "battery", 
      name: "Bateria", 
      nameEn: "Battery", 
      icon: "🔋",
      procedures: [
        { id: "replace", name: "Substituir", nameEn: "Replace" },
        { id: "clean_terminals", name: "Limpar Terminais", nameEn: "Clean Terminals" },
        { id: "jumpstart", name: "Dar Partida", nameEn: "Jumpstart" },
      ]
    },
    { 
      id: "brakes", 
      name: "Freios", 
      nameEn: "Brakes", 
      icon: "🛑",
      procedures: [
        { id: "replace_front_brakes", name: "Trocar Freios Dianteiros", nameEn: "Replace Front Brakes" },
        { id: "replace_rear_brakes", name: "Trocar Freios Traseiros", nameEn: "Replace Rear Brakes" },
        { id: "check_brake_fluid", name: "Verificar Fluido", nameEn: "Check Brake Fluid" },
      ]
    },
    { 
      id: "coolant_antifreeze", 
      name: "Arrefecimento", 
      nameEn: "Coolant (Antifreeze)", 
      icon: "🌡️",
      procedures: [
        { id: "add", name: "Adicionar", nameEn: "Add" },
        { id: "flush", name: "Trocar", nameEn: "Flush" },
        { id: "fix_minor_leaks", name: "Corrigir Vazamentos", nameEn: "Fix Minor Leaks" },
      ]
    },
    { 
      id: "headlight", 
      name: "Faróis", 
      nameEn: "Headlight", 
      icon: "💡",
      procedures: [
        { id: "change_bulb", name: "Trocar Lâmpada", nameEn: "Change Bulb" },
        { id: "replace_fuse", name: "Trocar Fusível", nameEn: "Replace Fuse" },
      ]
    },
    { 
      id: "highbeam", 
      name: "Farol Alto", 
      nameEn: "Highbeam (Brights)", 
      icon: "💡",
      procedures: [
        { id: "change_bulb", name: "Trocar Lâmpada", nameEn: "Change Bulb" },
      ]
    },
    { 
      id: "brake_light", 
      name: "Luz de Freio", 
      nameEn: "Brake Light", 
      icon: "🔴",
      procedures: [
        { id: "change_bulb", name: "Trocar Lâmpada", nameEn: "Change Bulb" },
      ]
    },
    { 
      id: "tail_light", 
      name: "Lanterna Traseira", 
      nameEn: "Tail Light", 
      icon: "💡",
      procedures: [
        { id: "change_bulb", name: "Trocar Lâmpada", nameEn: "Change Bulb" },
      ]
    },
    { 
      id: "oil", 
      name: "Óleo do Motor", 
      nameEn: "Oil & Oil Filter", 
      icon: "🛢️",
      procedures: [
        { id: "change_oil", name: "Trocar Óleo", nameEn: "Change Oil" },
        { id: "fix_minor_leaks", name: "Corrigir Vazamentos", nameEn: "Fix Minor Leaks" },
      ]
    },
    { 
      id: "power_steering", 
      name: "Direção Hidráulica", 
      nameEn: "Power Steering", 
      icon: "🔧",
      procedures: [
        { id: "add_fluid", name: "Adicionar Fluido", nameEn: "Add Fluid" },
        { id: "fix_minor_leaks", name: "Corrigir Vazamentos", nameEn: "Fix Minor Leaks" },
      ]
    },
    { 
      id: "transmission_fluid", 
      name: "Transmissão", 
      nameEn: "Transmission Fluid", 
      icon: "⚙️",
      procedures: [
        { id: "add", name: "Adicionar", nameEn: "Add" },
        { id: "fix_minor_leaks", name: "Corrigir Vazamentos", nameEn: "Fix Minor Leaks" },
      ]
    },
    { 
      id: "washer_fluid", 
      name: "Fluido do Limpador", 
      nameEn: "Washer Fluid", 
      icon: "💧",
      procedures: [
        { id: "add", name: "Adicionar", nameEn: "Add" },
        { id: "check_level", name: "Verificar Nível", nameEn: "Check Level" },
      ]
    },
    { 
      id: "wipers", 
      name: "Palhetas", 
      nameEn: "Windshield Wipers", 
      icon: "🪟",
      procedures: [
        { id: "replace_wipers", name: "Substituir", nameEn: "Replace Wipers" },
      ]
    },
    { 
      id: "tires_wheels", 
      name: "Pneus e Rodas", 
      nameEn: "Tires & Wheels", 
      icon: "⭕",
      procedures: [
        { id: "change_tire", name: "Trocar Pneu", nameEn: "Change Tire" },
        { id: "add_air", name: "Calibrar", nameEn: "Add Air" },
      ]
    },
    { 
      id: "interior_fuse", 
      name: "Fusíveis Internos", 
      nameEn: "Interior Fuse Box", 
      icon: "🔌",
      procedures: [
        { id: "replace", name: "Substituir", nameEn: "Replace" },
        { id: "diagram", name: "Diagrama", nameEn: "Diagram" },
      ]
    },
    { 
      id: "engine_fuse", 
      name: "Fusíveis do Motor", 
      nameEn: "Engine Fuse Box", 
      icon: "🔌",
      procedures: [
        { id: "replace", name: "Substituir", nameEn: "Replace" },
        { id: "diagram", name: "Diagrama", nameEn: "Diagram" },
      ]
    },
  ];
  
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    nameEn: cat.nameEn,
    icon: cat.icon,
    vehicleContext,
    url: buildCarCareKioskUrl(yearStr, brandStr, modelStr, cat.id),
    procedures: cat.procedures.map(proc => ({
      id: proc.id,
      name: proc.name,
      nameEn: proc.nameEn,
      url: buildCarCareKioskUrl(yearStr, brandStr, modelStr, cat.id, proc.id),
    })),
  }));
}
