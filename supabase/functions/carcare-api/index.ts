const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CarCareRequest {
  action: "brands" | "models" | "videos" | "video-details";
  brand?: string;
  model?: string;
  year?: string;
  procedure?: string;
}

// Lista completa de marcas com dados estáticos (mais confiável que scraping)
const CAR_BRANDS = [
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
  { id: "mazda", name: "Mazda", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mazda_CX-5/front_48519.jpg" },
  { id: "mercedes-benz", name: "Mercedes-Benz", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mercedes-Benz_GLC/front_48581.jpg" },
  { id: "mitsubishi", name: "Mitsubishi", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Mitsubishi_Outlander/front_48662.jpg" },
  { id: "nissan", name: "Nissan", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Nissan_Rogue/front_48709.jpg" },
  { id: "porsche", name: "Porsche", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Porsche_Cayenne/front_48793.jpg" },
  { id: "ram", name: "Ram", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Ram_1500/front_48835.jpg" },
  { id: "subaru", name: "Subaru", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Subaru_Outback/front_48914.jpg" },
  { id: "tesla", name: "Tesla", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Tesla_Model_3/front_48962.jpg" },
  { id: "toyota", name: "Toyota", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Toyota_RAV4/front_49030.jpg" },
  { id: "volkswagen", name: "Volkswagen", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Volkswagen_Tiguan/front_49105.jpg" },
  { id: "volvo", name: "Volvo", image: "https://www.carcarekiosk.com/imager/vehicles/2019_Volvo_XC60/front_49156.jpg" },
];

// Categorias de procedimentos com vídeos do YouTube em português
const MAINTENANCE_CATEGORIES = [
  {
    id: "air_conditioner",
    name: "Ar Condicionado",
    nameEn: "Air Conditioner",
    icon: "❄️",
    procedures: [
      { id: "recharge_freon", name: "Recarregar Gás", nameEn: "Recharge Freon" },
    ],
    videos: [
      { title: "Como recarregar ar condicionado automotivo", url: "https://www.youtube.com/watch?v=kkP5dBTvLU8" },
      { title: "Limpeza do ar condicionado do carro", url: "https://www.youtube.com/watch?v=Jp2_oC5G6TA" },
    ]
  },
  {
    id: "air_filter_cabin",
    name: "Filtro de Cabine",
    nameEn: "Air Filter (Cabin)",
    icon: "🌬️",
    procedures: [
      { id: "replace", name: "Substituir", nameEn: "Replace" },
    ],
    videos: [
      { title: "Como trocar filtro de cabine", url: "https://www.youtube.com/watch?v=qrKZHqPVe_I" },
      { title: "Troca de filtro de ar condicionado", url: "https://www.youtube.com/watch?v=0t-WLxfJWO4" },
    ]
  },
  {
    id: "air_filter_engine",
    name: "Filtro de Ar do Motor",
    nameEn: "Air Filter (Engine)",
    icon: "🔧",
    procedures: [
      { id: "replace", name: "Substituir", nameEn: "Replace" },
    ],
    videos: [
      { title: "Como trocar filtro de ar do motor", url: "https://www.youtube.com/watch?v=O1hF25Cowv8" },
      { title: "Manutenção do filtro de ar", url: "https://www.youtube.com/watch?v=RqhNQZAR9LY" },
    ]
  },
  {
    id: "battery",
    name: "Bateria",
    nameEn: "Battery",
    icon: "🔋",
    procedures: [
      { id: "jump_start", name: "Chupeta", nameEn: "Jumpstart" },
      { id: "replace", name: "Substituir", nameEn: "Replace" },
    ],
    videos: [
      { title: "Como dar chupeta na bateria", url: "https://www.youtube.com/watch?v=LxqmN7sDm5U" },
      { title: "Trocar bateria do carro", url: "https://www.youtube.com/watch?v=en3TJBELisc" },
      { title: "Como testar bateria automotiva", url: "https://www.youtube.com/watch?v=x9Zfo6P-aBs" },
    ]
  },
  {
    id: "brake_fluid",
    name: "Fluido de Freio",
    nameEn: "Brake Fluid",
    icon: "🛑",
    procedures: [
      { id: "add_fluid", name: "Adicionar Fluido", nameEn: "Add Fluid" },
      { id: "check_level", name: "Verificar Nível", nameEn: "Check Fluid Level" },
    ],
    videos: [
      { title: "Como verificar fluido de freio", url: "https://www.youtube.com/watch?v=FnM67G8V6WY" },
      { title: "Sangria do sistema de freio", url: "https://www.youtube.com/watch?v=uGX3rh6qjQw" },
    ]
  },
  {
    id: "brakes",
    name: "Freios",
    nameEn: "Brakes",
    icon: "🛞",
    procedures: [
      { id: "replace_pads", name: "Trocar Pastilhas", nameEn: "Replace Brake Pads" },
      { id: "replace_rotors", name: "Trocar Discos", nameEn: "Replace Rotors" },
    ],
    videos: [
      { title: "Como trocar pastilhas de freio", url: "https://www.youtube.com/watch?v=FnM67G8V6WY" },
      { title: "Trocar discos de freio", url: "https://www.youtube.com/watch?v=WqQvAfHc2H8" },
      { title: "Manutenção completa dos freios", url: "https://www.youtube.com/watch?v=uGX3rh6qjQw" },
    ]
  },
  {
    id: "coolant",
    name: "Arrefecimento",
    nameEn: "Coolant (Antifreeze)",
    icon: "🌡️",
    procedures: [
      { id: "add_coolant", name: "Adicionar Coolant", nameEn: "Add Coolant" },
      { id: "check_level", name: "Verificar Nível", nameEn: "Check Coolant Level" },
      { id: "flush", name: "Trocar Coolant", nameEn: "Flush Coolant" },
    ],
    videos: [
      { title: "Trocar líquido de arrefecimento", url: "https://www.youtube.com/watch?v=2rT4p-GDWZE" },
      { title: "Verificar termostato do carro", url: "https://www.youtube.com/watch?v=lKZQT8JJlps" },
    ]
  },
  {
    id: "engine_oil",
    name: "Óleo do Motor",
    nameEn: "Engine Oil",
    icon: "🛢️",
    procedures: [
      { id: "add_oil", name: "Adicionar Óleo", nameEn: "Add Oil" },
      { id: "change_oil", name: "Trocar Óleo", nameEn: "Change Oil" },
      { id: "check_level", name: "Verificar Nível", nameEn: "Check Oil Level" },
    ],
    videos: [
      { title: "Como trocar óleo do motor", url: "https://www.youtube.com/watch?v=yKEkLQ-OU_8" },
      { title: "Verificar nível do óleo", url: "https://www.youtube.com/watch?v=bM_sT52R7Xo" },
      { title: "Escolher o óleo certo para seu carro", url: "https://www.youtube.com/watch?v=m_V9v2KgxoA" },
    ]
  },
  {
    id: "headlights",
    name: "Faróis",
    nameEn: "Headlights",
    icon: "💡",
    procedures: [
      { id: "replace_bulb", name: "Trocar Lâmpada", nameEn: "Replace Bulb" },
      { id: "adjust", name: "Regular", nameEn: "Adjust" },
    ],
    videos: [
      { title: "Trocar lâmpada do farol", url: "https://www.youtube.com/watch?v=en3TJBELisc" },
      { title: "Regular altura dos faróis", url: "https://www.youtube.com/watch?v=x9Zfo6P-aBs" },
    ]
  },
  {
    id: "suspension",
    name: "Suspensão",
    nameEn: "Suspension",
    icon: "🔩",
    procedures: [
      { id: "check", name: "Verificar", nameEn: "Check" },
    ],
    videos: [
      { title: "Verificar amortecedores", url: "https://www.youtube.com/watch?v=D1DwFLxF5kQ" },
      { title: "Trocar pivô de suspensão", url: "https://www.youtube.com/watch?v=a4UVCEqBH6U" },
    ]
  },
  {
    id: "tires",
    name: "Pneus",
    nameEn: "Tires",
    icon: "⭕",
    procedures: [
      { id: "change", name: "Trocar Pneu", nameEn: "Change Tire" },
      { id: "pressure", name: "Calibrar", nameEn: "Check Pressure" },
      { id: "rotate", name: "Rodízio", nameEn: "Rotate" },
    ],
    videos: [
      { title: "Como trocar pneu furado", url: "https://www.youtube.com/watch?v=joBmbh0AGSQ" },
      { title: "Calibrar pneus corretamente", url: "https://www.youtube.com/watch?v=F9vA5L2aLoI" },
    ]
  },
  {
    id: "transmission",
    name: "Transmissão",
    nameEn: "Transmission",
    icon: "⚙️",
    procedures: [
      { id: "check_fluid", name: "Verificar Fluido", nameEn: "Check Fluid" },
      { id: "change_fluid", name: "Trocar Fluido", nameEn: "Change Fluid" },
    ],
    videos: [
      { title: "Verificar óleo do câmbio", url: "https://www.youtube.com/watch?v=yKEkLQ-OU_8" },
      { title: "Manutenção da embreagem", url: "https://www.youtube.com/watch?v=m_V9v2KgxoA" },
    ]
  },
  {
    id: "windshield",
    name: "Para-brisa",
    nameEn: "Windshield",
    icon: "🪟",
    procedures: [
      { id: "replace_wipers", name: "Trocar Palhetas", nameEn: "Replace Wipers" },
      { id: "add_fluid", name: "Adicionar Fluido", nameEn: "Add Washer Fluid" },
    ],
    videos: [
      { title: "Trocar palhetas do limpador", url: "https://www.youtube.com/watch?v=5KMDpgLfJQk" },
      { title: "Manutenção do sistema de limpeza", url: "https://www.youtube.com/watch?v=VJ1mPqLfrE0" },
    ]
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as CarCareRequest;
    const { action, brand, model, year, procedure } = body;

    console.log("CarCare API request:", { action, brand, model, year, procedure });

    switch (action) {
      case "brands":
        return new Response(
          JSON.stringify({
            success: true,
            data: CAR_BRANDS,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "models":
        if (!brand) {
          return new Response(
            JSON.stringify({ success: false, error: "Brand is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Buscar modelos do CarCareKiosk via scraping
        const models = await fetchModelsForBrand(brand);
        return new Response(
          JSON.stringify({ success: true, data: models }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "videos":
        // Retorna categorias de manutenção com vídeos
        const categories = MAINTENANCE_CATEGORIES.map(cat => ({
          ...cat,
          vehicleContext: brand && model ? `${brand} ${model} ${year || ""}` : null,
        }));
        
        return new Response(
          JSON.stringify({ success: true, data: categories }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "video-details":
        if (!procedure) {
          return new Response(
            JSON.stringify({ success: false, error: "Procedure is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const category = MAINTENANCE_CATEGORIES.find(c => c.id === procedure);
        if (!category) {
          return new Response(
            JSON.stringify({ success: false, error: "Category not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Tentar buscar vídeo específico do CarCareKiosk
        let carCareVideo = null;
        if (brand && model) {
          carCareVideo = await fetchCarCareVideo(brand, model, year, procedure);
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              category,
              carCareVideo,
              vehicle: brand && model ? { brand, model, year } : null,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

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

async function fetchModelsForBrand(brand: string): Promise<any[]> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) {
    // Retorna modelos estáticos se Firecrawl não estiver disponível
    return getStaticModels(brand);
  }

  try {
    const brandSlug = brand.toLowerCase().replace(/\s+/g, "-");
    const url = `https://www.carcarekiosk.com/make/${brandSlug}`;

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html"],
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl error fetching models:", response.status);
      return getStaticModels(brand);
    }

    const data = await response.json();
    const html = data.data?.html || "";
    
    // Parse models from HTML
    const models = parseModelsFromHtml(html, brand);
    
    if (models.length === 0) {
      return getStaticModels(brand);
    }

    return models;
  } catch (error) {
    console.error("Error fetching models:", error);
    return getStaticModels(brand);
  }
}

function parseModelsFromHtml(html: string, brand: string): any[] {
  const models: any[] = [];
  
  // Regex para encontrar modelos e anos
  const modelRegex = /<a[^>]*href="\/video\/([^"]+)"[^>]*>[\s\S]*?<div[^>]*>([^<]+)<\/div>[\s\S]*?(\d{4}(?:-\d{4})?)/gi;
  
  let match;
  const seen = new Set();
  
  while ((match = modelRegex.exec(html)) !== null) {
    const [, url, modelName, years] = match;
    const key = `${modelName}-${years}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      models.push({
        id: url,
        name: modelName.trim(),
        years,
        image: `https://www.carcarekiosk.com/imager/vehicles/${url.split('/').pop()}/front.jpg`,
        url: `https://www.carcarekiosk.com/video/${url}`,
      });
    }
  }

  return models;
}

function getStaticModels(brand: string): any[] {
  // Modelos populares por marca
  const staticModels: Record<string, any[]> = {
    honda: [
      { id: "civic", name: "Civic", years: "2016-2024", image: "/placeholder.svg" },
      { id: "accord", name: "Accord", years: "2018-2024", image: "/placeholder.svg" },
      { id: "cr-v", name: "CR-V", years: "2017-2024", image: "/placeholder.svg" },
      { id: "hr-v", name: "HR-V", years: "2016-2024", image: "/placeholder.svg" },
      { id: "fit", name: "Fit", years: "2015-2021", image: "/placeholder.svg" },
    ],
    toyota: [
      { id: "corolla", name: "Corolla", years: "2014-2024", image: "/placeholder.svg" },
      { id: "hilux", name: "Hilux", years: "2016-2024", image: "/placeholder.svg" },
      { id: "rav4", name: "RAV4", years: "2019-2024", image: "/placeholder.svg" },
      { id: "yaris", name: "Yaris", years: "2018-2024", image: "/placeholder.svg" },
      { id: "camry", name: "Camry", years: "2018-2024", image: "/placeholder.svg" },
    ],
    volkswagen: [
      { id: "gol", name: "Gol", years: "2008-2023", image: "/placeholder.svg" },
      { id: "polo", name: "Polo", years: "2018-2024", image: "/placeholder.svg" },
      { id: "virtus", name: "Virtus", years: "2018-2024", image: "/placeholder.svg" },
      { id: "t-cross", name: "T-Cross", years: "2019-2024", image: "/placeholder.svg" },
      { id: "nivus", name: "Nivus", years: "2020-2024", image: "/placeholder.svg" },
    ],
    chevrolet: [
      { id: "onix", name: "Onix", years: "2012-2024", image: "/placeholder.svg" },
      { id: "tracker", name: "Tracker", years: "2020-2024", image: "/placeholder.svg" },
      { id: "s10", name: "S10", years: "2012-2024", image: "/placeholder.svg" },
      { id: "cruze", name: "Cruze", years: "2016-2024", image: "/placeholder.svg" },
      { id: "spin", name: "Spin", years: "2012-2024", image: "/placeholder.svg" },
    ],
    ford: [
      { id: "ka", name: "Ka", years: "2014-2021", image: "/placeholder.svg" },
      { id: "ranger", name: "Ranger", years: "2012-2024", image: "/placeholder.svg" },
      { id: "ecosport", name: "EcoSport", years: "2012-2022", image: "/placeholder.svg" },
      { id: "bronco", name: "Bronco Sport", years: "2021-2024", image: "/placeholder.svg" },
      { id: "territory", name: "Territory", years: "2020-2024", image: "/placeholder.svg" },
    ],
    hyundai: [
      { id: "hb20", name: "HB20", years: "2012-2024", image: "/placeholder.svg" },
      { id: "creta", name: "Creta", years: "2017-2024", image: "/placeholder.svg" },
      { id: "tucson", name: "Tucson", years: "2016-2024", image: "/placeholder.svg" },
      { id: "i30", name: "i30", years: "2009-2021", image: "/placeholder.svg" },
      { id: "santa-fe", name: "Santa Fe", years: "2019-2024", image: "/placeholder.svg" },
    ],
    fiat: [
      { id: "argo", name: "Argo", years: "2017-2024", image: "/placeholder.svg" },
      { id: "cronos", name: "Cronos", years: "2018-2024", image: "/placeholder.svg" },
      { id: "toro", name: "Toro", years: "2016-2024", image: "/placeholder.svg" },
      { id: "pulse", name: "Pulse", years: "2021-2024", image: "/placeholder.svg" },
      { id: "strada", name: "Strada", years: "2020-2024", image: "/placeholder.svg" },
    ],
    jeep: [
      { id: "compass", name: "Compass", years: "2017-2024", image: "/placeholder.svg" },
      { id: "renegade", name: "Renegade", years: "2015-2024", image: "/placeholder.svg" },
      { id: "commander", name: "Commander", years: "2021-2024", image: "/placeholder.svg" },
      { id: "wrangler", name: "Wrangler", years: "2018-2024", image: "/placeholder.svg" },
    ],
    nissan: [
      { id: "kicks", name: "Kicks", years: "2016-2024", image: "/placeholder.svg" },
      { id: "versa", name: "Versa", years: "2011-2024", image: "/placeholder.svg" },
      { id: "sentra", name: "Sentra", years: "2007-2024", image: "/placeholder.svg" },
      { id: "frontier", name: "Frontier", years: "2016-2024", image: "/placeholder.svg" },
    ],
    renault: [
      { id: "kwid", name: "Kwid", years: "2017-2024", image: "/placeholder.svg" },
      { id: "sandero", name: "Sandero", years: "2007-2024", image: "/placeholder.svg" },
      { id: "duster", name: "Duster", years: "2011-2024", image: "/placeholder.svg" },
      { id: "captur", name: "Captur", years: "2017-2024", image: "/placeholder.svg" },
    ],
  };

  const brandLower = brand.toLowerCase().replace(/\s+/g, "-");
  return staticModels[brandLower] || [
    { id: "generic", name: "Modelo genérico", years: "2010-2024", image: "/placeholder.svg" },
  ];
}

async function fetchCarCareVideo(brand: string, model: string, year: string | undefined, procedure: string): Promise<any | null> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!FIRECRAWL_API_KEY) {
    return null;
  }

  try {
    // Construir URL do CarCareKiosk
    const searchQuery = `site:carcarekiosk.com ${brand} ${model} ${year || ""} ${procedure.replace(/_/g, " ")}`;
    
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 1,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const result = data.data?.[0];

    if (result) {
      return {
        url: result.url,
        title: result.title?.replace(/\s*\|\s*CarCareKiosk.*$/i, "").trim(),
        description: result.description,
        thumbnail: extractThumbnailFromMarkdown(result.markdown),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching CarCare video:", error);
    return null;
  }
}

function extractThumbnailFromMarkdown(markdown: string | undefined): string | null {
  if (!markdown) return null;
  const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
  return imgMatch ? imgMatch[1] : null;
}
