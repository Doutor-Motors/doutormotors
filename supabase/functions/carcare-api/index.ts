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
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as CarCareRequest;
    const { action, brand, model, year, procedure, query } = body;

    console.log("CarCare API request:", { action, brand, model, year, procedure, query });

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "brands": {
        // Buscar marcas diretamente do CarCareKiosk
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
        
        const videoDetails = await fetchVideoDetails(FIRECRAWL_API_KEY, procedure);
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
    
    // Parse brands from HTML
    const brands: any[] = [];
    
    // Regex para encontrar links de marcas: /make/brand-name
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

    // Se não encontrou marcas com o primeiro regex, tentar outro padrão
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

    // Regex para encontrar modelos com link e imagem
    // Padrão: /video/YEAR_Brand_Model
    const modelRegex = /<a[^>]*href="(\/video\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[\s\S]*?<\/a>/gi;
    
    let match;
    while ((match = modelRegex.exec(html)) !== null) {
      const [, videoPath, imageUrl] = match;
      
      // Extrair ano e modelo do path
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

    // Tentar padrão alternativo se não encontrou modelos
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

    // Ordenar por ano (mais recente primeiro) e nome
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
    // Construir URL do veículo
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

    // Regex para encontrar categorias/procedimentos
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

    // Tentar extrair do markdown se não encontrou no HTML
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
async function fetchVideoDetails(apiKey: string, videoUrl: string): Promise<any> {
  try {
    const url = videoUrl.startsWith('http') 
      ? videoUrl 
      : `https://www.carcarekiosk.com${videoUrl}`;
    
    console.log(`Fetching video details from ${url}...`);

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
    
    // Extrair URL do vídeo do YouTube (iframe)
    let videoEmbedUrl = null;
    const iframeMatch = html.match(/src="(https:\/\/www\.youtube\.com\/embed\/[^"]+)"/);
    if (iframeMatch) {
      videoEmbedUrl = iframeMatch[1];
    }
    
    // Extrair vídeo do YouTube do markdown
    if (!videoEmbedUrl) {
      const youtubeMatch = markdown.match(/youtube\.com\/(?:watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) {
        videoEmbedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }
    }

    // Extrair título
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : metadata.title || "Tutorial";

    // Extrair passos/instruções
    const steps: string[] = [];
    const stepRegex = /<li[^>]*>([^<]+)<\/li>/gi;
    let stepMatch;
    while ((stepMatch = stepRegex.exec(html)) !== null) {
      const step = stepMatch[1].trim();
      if (step.length > 10 && step.length < 500) {
        steps.push(step);
      }
    }

    return {
      title,
      description: metadata.description || "",
      videoUrl: videoEmbedUrl,
      sourceUrl: url,
      steps,
      markdown: markdown.slice(0, 5000), // Limitar tamanho
    };
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

// Helpers
function formatBrandName(slug: string): string {
  const specialNames: Record<string, string> = {
    "bmw": "BMW",
    "gmc": "GMC",
    "ram": "Ram",
    "mini": "MINI",
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
  // Remove o nome da marca do slug se estiver presente
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

// Dados estáticos de fallback
function getStaticBrands(): any[] {
  return [
    { id: "acura", name: "Acura", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Acura_ILX/front_47626.jpg" },
    { id: "alfa-romeo", name: "Alfa Romeo", image: "https://www.carcarekiosk.com/imager/vehicles/2018_Alfa_Romeo_Stelvio/front_49181.jpg" },
    { id: "audi", name: "Audi", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Audi_Q5/front_47655.jpg" },
    { id: "bmw", name: "BMW", image: "https://www.carcarekiosk.com/imager/vehicles/2019_BMW_X3/front_47682.jpg" },
    { id: "buick", name: "Buick", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Buick_Envision/front_47696.jpg" },
    { id: "cadillac", name: "Cadillac", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Cadillac_XT4/front_47722.jpg" },
    { id: "chevrolet", name: "Chevrolet", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Chevrolet_Equinox/front_47758.jpg" },
    { id: "chrysler", name: "Chrysler", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Chrysler_Pacifica/front_47823.jpg" },
    { id: "dodge", name: "Dodge", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Dodge_Charger/front_47869.jpg" },
    { id: "fiat", name: "Fiat", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Fiat_500X/front_47915.jpg" },
    { id: "ford", name: "Ford", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Ford_Escape/front_47945.jpg" },
    { id: "genesis", name: "Genesis", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Genesis_G70/front.jpg" },
    { id: "gmc", name: "GMC", image: "https://www.carcarekiosk.com/imager/vehicles/2019_GMC_Terrain/front_48027.jpg" },
    { id: "honda", name: "Honda", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Honda_Civic/front_48079.jpg" },
    { id: "hyundai", name: "Hyundai", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Hyundai_Tucson/front_48155.jpg" },
    { id: "infiniti", name: "Infiniti", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Infiniti_QX60/front_48198.jpg" },
    { id: "jaguar", name: "Jaguar", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Jaguar_F-Pace/front_48238.jpg" },
    { id: "jeep", name: "Jeep", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Jeep_Compass/front_48272.jpg" },
    { id: "kia", name: "Kia", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Kia_Sportage/front_48337.jpg" },
    { id: "land-rover", name: "Land Rover", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Land_Rover_Discovery/front_48375.jpg" },
    { id: "lexus", name: "Lexus", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Lexus_RX_350/front_48422.jpg" },
    { id: "lincoln", name: "Lincoln", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Lincoln_MKC/front_48473.jpg" },
    { id: "maserati", name: "Maserati", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Maserati_Ghibli/front.jpg" },
    { id: "mazda", name: "Mazda", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mazda_CX-5/front_48519.jpg" },
    { id: "mercedes-benz", name: "Mercedes-Benz", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mercedes-Benz_GLC/front_48581.jpg" },
    { id: "mini", name: "MINI", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mini_Countryman/front.jpg" },
    { id: "mitsubishi", name: "Mitsubishi", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mitsubishi_Outlander/front_48662.jpg" },
    { id: "nissan", name: "Nissan", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Nissan_Rogue/front_48709.jpg" },
    { id: "peugeot", name: "Peugeot", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Peugeot_308/front.jpg" },
    { id: "porsche", name: "Porsche", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Porsche_Cayenne/front_48793.jpg" },
    { id: "ram", name: "Ram", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Ram_1500/front_48835.jpg" },
    { id: "renault", name: "Renault", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Renault_Duster/front.jpg" },
    { id: "subaru", name: "Subaru", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Subaru_Outback/front_48914.jpg" },
    { id: "tesla", name: "Tesla", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Tesla_Model_3/front_48962.jpg" },
    { id: "toyota", name: "Toyota", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Toyota_RAV4/front_49030.jpg" },
    { id: "volkswagen", name: "Volkswagen", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Volkswagen_Tiguan/front_49105.jpg" },
    { id: "volvo", name: "Volvo", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Volvo_XC60/front_49156.jpg" },
  ];
}

function getStaticModels(brand: string): any[] {
  const staticModels: Record<string, any[]> = {
    honda: [
      { id: "2024_Honda_Accord", name: "Accord", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Honda_Accord/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Honda_Accord" },
      { id: "2024_Honda_Civic", name: "Civic", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Honda_Civic/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Honda_Civic" },
      { id: "2024_Honda_CR-V", name: "CR-V", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Honda_CR-V/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Honda_CR-V" },
      { id: "2024_Honda_HR-V", name: "HR-V", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Honda_HR-V/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Honda_HR-V" },
      { id: "2024_Honda_Pilot", name: "Pilot", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Honda_Pilot/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Honda_Pilot" },
    ],
    toyota: [
      { id: "2024_Toyota_Camry", name: "Camry", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Toyota_Camry/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Toyota_Camry" },
      { id: "2024_Toyota_Corolla", name: "Corolla", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Toyota_Corolla/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Toyota_Corolla" },
      { id: "2024_Toyota_RAV4", name: "RAV4", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Toyota_RAV4/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Toyota_RAV4" },
      { id: "2024_Toyota_Highlander", name: "Highlander", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Toyota_Highlander/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Toyota_Highlander" },
      { id: "2024_Toyota_Tacoma", name: "Tacoma", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Toyota_Tacoma/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Toyota_Tacoma" },
    ],
    ford: [
      { id: "2024_Ford_F-150", name: "F-150", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Ford_F-150/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Ford_F-150" },
      { id: "2024_Ford_Escape", name: "Escape", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Ford_Escape/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Ford_Escape" },
      { id: "2024_Ford_Explorer", name: "Explorer", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Ford_Explorer/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Ford_Explorer" },
      { id: "2024_Ford_Bronco", name: "Bronco", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Ford_Bronco/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Ford_Bronco" },
      { id: "2024_Ford_Mustang", name: "Mustang", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Ford_Mustang/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Ford_Mustang" },
    ],
    chevrolet: [
      { id: "2024_Chevrolet_Silverado", name: "Silverado", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Chevrolet_Silverado_1500/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Chevrolet_Silverado_1500" },
      { id: "2024_Chevrolet_Equinox", name: "Equinox", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Chevrolet_Equinox/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Chevrolet_Equinox" },
      { id: "2024_Chevrolet_Malibu", name: "Malibu", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Chevrolet_Malibu/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Chevrolet_Malibu" },
      { id: "2024_Chevrolet_Traverse", name: "Traverse", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Chevrolet_Traverse/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Chevrolet_Traverse" },
      { id: "2024_Chevrolet_Colorado", name: "Colorado", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Chevrolet_Colorado/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Chevrolet_Colorado" },
    ],
    volkswagen: [
      { id: "2024_Volkswagen_Jetta", name: "Jetta", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Volkswagen_Jetta/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Volkswagen_Jetta" },
      { id: "2024_Volkswagen_Tiguan", name: "Tiguan", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Volkswagen_Tiguan/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Volkswagen_Tiguan" },
      { id: "2024_Volkswagen_Atlas", name: "Atlas", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Volkswagen_Atlas/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Volkswagen_Atlas" },
      { id: "2024_Volkswagen_Taos", name: "Taos", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Volkswagen_Taos/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Volkswagen_Taos" },
      { id: "2024_Volkswagen_ID.4", name: "ID.4", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Volkswagen_ID.4/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Volkswagen_ID.4" },
    ],
    hyundai: [
      { id: "2024_Hyundai_Tucson", name: "Tucson", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Hyundai_Tucson/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Hyundai_Tucson" },
      { id: "2024_Hyundai_Santa_Fe", name: "Santa Fe", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Hyundai_Santa_Fe/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Hyundai_Santa_Fe" },
      { id: "2024_Hyundai_Elantra", name: "Elantra", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Hyundai_Elantra/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Hyundai_Elantra" },
      { id: "2024_Hyundai_Kona", name: "Kona", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Hyundai_Kona/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Hyundai_Kona" },
      { id: "2024_Hyundai_Palisade", name: "Palisade", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Hyundai_Palisade/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Hyundai_Palisade" },
    ],
    nissan: [
      { id: "2024_Nissan_Rogue", name: "Rogue", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Nissan_Rogue/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Nissan_Rogue" },
      { id: "2024_Nissan_Altima", name: "Altima", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Nissan_Altima/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Nissan_Altima" },
      { id: "2024_Nissan_Sentra", name: "Sentra", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Nissan_Sentra/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Nissan_Sentra" },
      { id: "2024_Nissan_Pathfinder", name: "Pathfinder", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Nissan_Pathfinder/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Nissan_Pathfinder" },
      { id: "2024_Nissan_Frontier", name: "Frontier", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Nissan_Frontier/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Nissan_Frontier" },
    ],
    kia: [
      { id: "2024_Kia_Sportage", name: "Sportage", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Kia_Sportage/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Kia_Sportage" },
      { id: "2024_Kia_Telluride", name: "Telluride", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Kia_Telluride/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Kia_Telluride" },
      { id: "2024_Kia_Forte", name: "Forte", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Kia_Forte/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Kia_Forte" },
      { id: "2024_Kia_Seltos", name: "Seltos", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Kia_Seltos/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Kia_Seltos" },
      { id: "2024_Kia_Sorento", name: "Sorento", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Kia_Sorento/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Kia_Sorento" },
    ],
    jeep: [
      { id: "2024_Jeep_Grand_Cherokee", name: "Grand Cherokee", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Jeep_Grand_Cherokee/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Jeep_Grand_Cherokee" },
      { id: "2024_Jeep_Wrangler", name: "Wrangler", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Jeep_Wrangler/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Jeep_Wrangler" },
      { id: "2024_Jeep_Compass", name: "Compass", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Jeep_Compass/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Jeep_Compass" },
      { id: "2024_Jeep_Gladiator", name: "Gladiator", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Jeep_Gladiator/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Jeep_Gladiator" },
      { id: "2024_Jeep_Cherokee", name: "Cherokee", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Jeep_Cherokee/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Jeep_Cherokee" },
    ],
    bmw: [
      { id: "2024_BMW_X3", name: "X3", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_BMW_X3/front.jpg", url: "https://www.carcarekiosk.com/video/2024_BMW_X3" },
      { id: "2024_BMW_X5", name: "X5", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_BMW_X5/front.jpg", url: "https://www.carcarekiosk.com/video/2024_BMW_X5" },
      { id: "2024_BMW_3_Series", name: "3 Series", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_BMW_330i/front.jpg", url: "https://www.carcarekiosk.com/video/2024_BMW_330i" },
      { id: "2024_BMW_5_Series", name: "5 Series", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_BMW_530i/front.jpg", url: "https://www.carcarekiosk.com/video/2024_BMW_530i" },
      { id: "2024_BMW_X1", name: "X1", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_BMW_X1/front.jpg", url: "https://www.carcarekiosk.com/video/2024_BMW_X1" },
    ],
    "mercedes-benz": [
      { id: "2024_Mercedes-Benz_GLC", name: "GLC", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mercedes-Benz_GLC/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mercedes-Benz_GLC" },
      { id: "2024_Mercedes-Benz_GLE", name: "GLE", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mercedes-Benz_GLE/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mercedes-Benz_GLE" },
      { id: "2024_Mercedes-Benz_C-Class", name: "C-Class", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mercedes-Benz_C300/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mercedes-Benz_C300" },
      { id: "2024_Mercedes-Benz_E-Class", name: "E-Class", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mercedes-Benz_E350/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mercedes-Benz_E350" },
      { id: "2024_Mercedes-Benz_GLA", name: "GLA", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mercedes-Benz_GLA/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mercedes-Benz_GLA" },
    ],
    audi: [
      { id: "2024_Audi_Q5", name: "Q5", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Audi_Q5/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Audi_Q5" },
      { id: "2024_Audi_Q7", name: "Q7", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Audi_Q7/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Audi_Q7" },
      { id: "2024_Audi_A4", name: "A4", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Audi_A4/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Audi_A4" },
      { id: "2024_Audi_A6", name: "A6", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Audi_A6/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Audi_A6" },
      { id: "2024_Audi_Q3", name: "Q3", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Audi_Q3/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Audi_Q3" },
    ],
    mazda: [
      { id: "2024_Mazda_CX-5", name: "CX-5", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mazda_CX-5/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mazda_CX-5" },
      { id: "2024_Mazda_CX-50", name: "CX-50", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mazda_CX-50/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mazda_CX-50" },
      { id: "2024_Mazda_3", name: "Mazda3", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mazda_3/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mazda_3" },
      { id: "2024_Mazda_CX-30", name: "CX-30", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mazda_CX-30/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mazda_CX-30" },
      { id: "2024_Mazda_CX-90", name: "CX-90", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Mazda_CX-90/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Mazda_CX-90" },
    ],
    subaru: [
      { id: "2024_Subaru_Outback", name: "Outback", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Subaru_Outback/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Subaru_Outback" },
      { id: "2024_Subaru_Forester", name: "Forester", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Subaru_Forester/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Subaru_Forester" },
      { id: "2024_Subaru_Crosstrek", name: "Crosstrek", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Subaru_Crosstrek/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Subaru_Crosstrek" },
      { id: "2024_Subaru_Ascent", name: "Ascent", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Subaru_Ascent/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Subaru_Ascent" },
      { id: "2024_Subaru_Impreza", name: "Impreza", years: "2024", image: "https://www.carcarekiosk.com/imager/vehicles/2024_Subaru_Impreza/front.jpg", url: "https://www.carcarekiosk.com/video/2024_Subaru_Impreza" },
    ],
  };

  const brandLower = brand.toLowerCase().replace(/\s+/g, "-");
  return staticModels[brandLower] || [];
}

function getStaticCategories(brand: string, model: string, year?: string): any[] {
  const vehicleContext = `${brand} ${model} ${year || ""}`;
  
  return [
    {
      id: "oil",
      name: "Oil Change",
      nameEn: "Oil Change",
      icon: "🛢️",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/engine_oil`,
      vehicleContext,
    },
    {
      id: "air-filter-cabin",
      name: "Cabin Air Filter",
      nameEn: "Cabin Air Filter",
      icon: "🌬️",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/air_filter_cabin`,
      vehicleContext,
    },
    {
      id: "air-filter-engine",
      name: "Engine Air Filter",
      nameEn: "Engine Air Filter",
      icon: "🔧",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/air_filter_engine`,
      vehicleContext,
    },
    {
      id: "battery",
      name: "Battery",
      nameEn: "Battery",
      icon: "🔋",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/battery`,
      vehicleContext,
    },
    {
      id: "brakes",
      name: "Brakes",
      nameEn: "Brakes",
      icon: "🛑",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/brakes`,
      vehicleContext,
    },
    {
      id: "coolant",
      name: "Coolant",
      nameEn: "Coolant",
      icon: "🌡️",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/coolant`,
      vehicleContext,
    },
    {
      id: "headlights",
      name: "Headlights",
      nameEn: "Headlights",
      icon: "💡",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/headlights`,
      vehicleContext,
    },
    {
      id: "tires",
      name: "Tires",
      nameEn: "Tires",
      icon: "⭕",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/tires`,
      vehicleContext,
    },
    {
      id: "wipers",
      name: "Windshield Wipers",
      nameEn: "Windshield Wipers",
      icon: "🪟",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/windshield`,
      vehicleContext,
    },
    {
      id: "transmission",
      name: "Transmission",
      nameEn: "Transmission",
      icon: "⚙️",
      url: `https://www.carcarekiosk.com/video/${year || "2024"}_${brand}_${model}/transmission`,
      vehicleContext,
    },
  ];
}
