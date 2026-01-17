const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TutorialSearchRequest {
  query?: string;
  category?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  limit?: number;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  duration?: string;
  difficulty?: string;
  url: string;
  steps?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, vehicleBrand, vehicleModel, vehicleYear, limit = 12 } = 
      await req.json() as TutorialSearchRequest;

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query
    let searchQuery = "site:carcarekiosk.com";
    
    if (query) {
      searchQuery += ` ${query}`;
    }
    
    if (category) {
      const categoryMap: Record<string, string> = {
        motor: "engine oil change tune up",
        freios: "brakes brake pads rotors",
        eletrica: "electrical battery alternator lights",
        suspensao: "suspension shocks struts",
        transmissao: "transmission fluid clutch",
        arrefecimento: "cooling coolant radiator thermostat",
        escapamento: "exhaust muffler catalytic",
        direcao: "steering power steering",
      };
      searchQuery += ` ${categoryMap[category] || category}`;
    }
    
    if (vehicleBrand) {
      searchQuery += ` ${vehicleBrand}`;
    }
    if (vehicleModel) {
      searchQuery += ` ${vehicleModel}`;
    }
    if (vehicleYear) {
      searchQuery += ` ${vehicleYear}`;
    }

    console.log("Searching tutorials:", searchQuery);

    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: limit,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Firecrawl search error:", searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to search tutorials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchData = await searchResponse.json();
    console.log("Search results count:", searchData.data?.length || 0);

    // Process and structure the results
    const tutorials: Tutorial[] = (searchData.data || []).map((result: any, index: number) => {
      const url = result.url || "";
      const title = result.title || extractTitle(result.markdown) || `Tutorial ${index + 1}`;
      const description = result.description || extractDescription(result.markdown) || "";
      
      // Extract category from URL or content
      const detectedCategory = detectCategory(url, result.markdown || "");
      
      // Generate a unique ID from URL
      const id = btoa(url).replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);

      return {
        id,
        title: cleanTitle(title),
        description: cleanDescription(description),
        category: detectedCategory,
        thumbnail: extractThumbnail(result.markdown),
        duration: extractDuration(result.markdown),
        difficulty: extractDifficulty(result.markdown),
        url,
        steps: extractSteps(result.markdown),
      };
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        tutorials,
        query: searchQuery,
        total: tutorials.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error searching tutorials:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractTitle(markdown: string | undefined): string {
  if (!markdown) return "";
  const match = markdown.match(/^#\s+(.+)/m);
  return match ? match[1] : "";
}

function extractDescription(markdown: string | undefined): string {
  if (!markdown) return "";
  // Get first paragraph after title
  const lines = markdown.split("\n").filter(l => l.trim() && !l.startsWith("#"));
  return lines[0]?.substring(0, 200) || "";
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*CarCareKiosk.*$/i, "")
    .replace(/\s*-\s*CarCareKiosk.*$/i, "")
    .trim();
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\*+/g, "")
    .trim()
    .substring(0, 150);
}

function detectCategory(url: string, content: string): string {
  const urlLower = url.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (urlLower.includes("engine") || urlLower.includes("oil") || contentLower.includes("engine")) return "motor";
  if (urlLower.includes("brake") || contentLower.includes("brake")) return "freios";
  if (urlLower.includes("electrical") || urlLower.includes("battery") || contentLower.includes("electrical")) return "eletrica";
  if (urlLower.includes("suspension") || contentLower.includes("suspension")) return "suspensao";
  if (urlLower.includes("transmission") || contentLower.includes("transmission")) return "transmissao";
  if (urlLower.includes("cool") || urlLower.includes("radiator") || contentLower.includes("coolant")) return "arrefecimento";
  if (urlLower.includes("exhaust") || contentLower.includes("exhaust")) return "escapamento";
  if (urlLower.includes("steering") || contentLower.includes("steering")) return "direcao";
  
  return "geral";
}

function extractThumbnail(markdown: string | undefined): string | undefined {
  if (!markdown) return undefined;
  const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
  return imgMatch ? imgMatch[1] : undefined;
}

function extractDuration(markdown: string | undefined): string {
  if (!markdown) return "15-30 min";
  const durationMatch = markdown.match(/(\d+)\s*(?:minutes?|mins?|min)/i);
  if (durationMatch) {
    const mins = parseInt(durationMatch[1]);
    if (mins < 30) return `${mins} min`;
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  }
  return "15-30 min";
}

function extractDifficulty(markdown: string | undefined): string {
  if (!markdown) return "intermediário";
  const lower = markdown.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner") || lower.includes("simple")) return "fácil";
  if (lower.includes("difficult") || lower.includes("advanced") || lower.includes("complex")) return "difícil";
  return "intermediário";
}

function extractSteps(markdown: string | undefined): number {
  if (!markdown) return 5;
  const stepMatches = markdown.match(/step\s*\d+/gi);
  if (stepMatches) return stepMatches.length;
  
  const numberedSteps = markdown.match(/^\d+\.\s/gm);
  if (numberedSteps) return numberedSteps.length;
  
  return 5;
}
