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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input with Zod - includes URL whitelist validation
    const validation = await validateRequest(req, tutorialFetchSchema);
    if (validation.error) {
      console.error("Validation error:", validation.error);
      return errorResponse(validation.error, 400, corsHeaders);
    }

    const { url, vehicleBrand, vehicleModel, vehicleYear } = validation.data!;

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      return errorResponse("Firecrawl not configured", 500, corsHeaders);
    }

    console.log("Fetching tutorial from:", url);

    // Scrape the tutorial page
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
    const metadata = scrapeData.data?.metadata || {};

    console.log("Scraped content length:", markdown.length);

    // If no AI key, return raw processed content
    if (!LOVABLE_API_KEY) {
      const basicContent: TutorialContent = {
        title: metadata.title || "Tutorial",
        description: metadata.description || "",
        steps: parseBasicSteps(markdown),
        tools: extractTools(markdown),
        parts: extractParts(markdown),
        warnings: extractWarnings(markdown),
        estimatedTime: "30 min",
        difficulty: "intermediário",
        videoUrl: extractVideoUrl(markdown, scrapeData.data?.html),
        sourceUrl: url,
      };

      return new Response(
        JSON.stringify({ success: true, content: basicContent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process with AI for better structure
    const vehicleContext = vehicleBrand 
      ? `Veículo: ${vehicleBrand} ${vehicleModel || ""} ${vehicleYear || ""}`
      : "";

    const systemPrompt = `Você é um especialista em mecânica automotiva. Sua função é processar conteúdo de tutoriais e transformá-los em guias claros, didáticos e bem estruturados em português brasileiro.

${vehicleContext}

INSTRUÇÕES:
1. Traduza todo o conteúdo para português brasileiro
2. Organize em passos claros e numerados
3. Use linguagem acessível para iniciantes
4. Identifique ferramentas e peças necessárias
5. Destaque avisos de segurança
6. Mantenha a precisão técnica`;

    const userPrompt = `Processe este tutorial e crie um guia estruturado:

${markdown.substring(0, 6000)}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_tutorial_guide",
              description: "Cria um guia de tutorial estruturado",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Título do tutorial em português" },
                  description: { type: "string", description: "Descrição do que será aprendido (2-3 frases)" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        number: { type: "number" },
                        title: { type: "string", description: "Título curto do passo" },
                        content: { type: "string", description: "Instruções detalhadas" },
                        tips: { type: "array", items: { type: "string" }, description: "Dicas úteis" },
                      },
                      required: ["number", "title", "content"],
                    },
                  },
                  tools: { type: "array", items: { type: "string" }, description: "Lista de ferramentas" },
                  parts: { type: "array", items: { type: "string" }, description: "Lista de peças" },
                  warnings: { type: "array", items: { type: "string" }, description: "Avisos de segurança" },
                  estimatedTime: { type: "string", description: "Tempo estimado" },
                  difficulty: { type: "string", enum: ["fácil", "intermediário", "difícil"] },
                },
                required: ["title", "description", "steps", "tools", "parts", "warnings", "estimatedTime", "difficulty"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_tutorial_guide" } },
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI processing error:", aiResponse.status);
      // Fall back to basic processing
      const basicContent: TutorialContent = {
        title: metadata.title || "Tutorial",
        description: metadata.description || "",
        steps: parseBasicSteps(markdown),
        tools: extractTools(markdown),
        parts: extractParts(markdown),
        warnings: extractWarnings(markdown),
        estimatedTime: "30 min",
        difficulty: "intermediário",
        videoUrl: extractVideoUrl(markdown, scrapeData.data?.html),
        sourceUrl: url,
      };

      return new Response(
        JSON.stringify({ success: true, content: basicContent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error("Invalid AI response");
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process tutorial" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const processedContent = JSON.parse(toolCall.function.arguments);
    
    const content: TutorialContent = {
      ...processedContent,
      videoUrl: extractVideoUrl(markdown, scrapeData.data?.html),
      sourceUrl: url,
    };

    console.log("Tutorial processed successfully");

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

function parseBasicSteps(markdown: string): Array<{ number: number; title: string; content: string }> {
  const steps: Array<{ number: number; title: string; content: string }> = [];
  
  // Try to find numbered steps
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
    // Split by paragraphs as fallback
    const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 50);
    paragraphs.slice(0, 6).forEach((p, i) => {
      steps.push({
        number: i + 1,
        title: `Passo ${i + 1}`,
        content: p.trim().substring(0, 500),
      });
    });
  }

  return steps.length > 0 ? steps : [{ number: 1, title: "Passo 1", content: "Consulte o tutorial original para instruções detalhadas." }];
}

function extractTools(markdown: string): string[] {
  const tools: string[] = [];
  const lower = markdown.toLowerCase();
  
  const commonTools = [
    "chave de fenda", "chave philips", "alicate", "torquímetro",
    "macaco", "cavalete", "scanner obd2", "multímetro", "chave catraca",
    "chave allen", "martelo", "lanterna", "luvas", "óculos de proteção"
  ];
  
  const englishTools: Record<string, string> = {
    "screwdriver": "chave de fenda",
    "wrench": "chave",
    "socket": "soquete",
    "pliers": "alicate",
    "jack": "macaco",
    "flashlight": "lanterna",
    "gloves": "luvas",
  };

  Object.entries(englishTools).forEach(([en, pt]) => {
    if (lower.includes(en)) tools.push(pt);
  });

  commonTools.forEach(tool => {
    if (lower.includes(tool)) tools.push(tool);
  });

  return [...new Set(tools)].slice(0, 8);
}

function extractParts(markdown: string): string[] {
  const parts: string[] = [];
  const lower = markdown.toLowerCase();
  
  const commonParts: Record<string, string> = {
    "oil filter": "filtro de óleo",
    "air filter": "filtro de ar",
    "brake pad": "pastilha de freio",
    "spark plug": "vela de ignição",
    "coolant": "líquido de arrefecimento",
    "battery": "bateria",
    "belt": "correia",
    "gasket": "junta",
  };

  Object.entries(commonParts).forEach(([en, pt]) => {
    if (lower.includes(en)) parts.push(pt);
  });

  return [...new Set(parts)].slice(0, 6);
}

function extractWarnings(markdown: string): string[] {
  const warnings: string[] = [];
  const lower = markdown.toLowerCase();
  
  if (lower.includes("hot") || lower.includes("quente")) {
    warnings.push("Cuidado com superfícies quentes - deixe o motor esfriar");
  }
  if (lower.includes("battery") || lower.includes("electrical")) {
    warnings.push("Desconecte a bateria antes de trabalhar no sistema elétrico");
  }
  if (lower.includes("jack") || lower.includes("lift")) {
    warnings.push("Use cavaletes de segurança ao trabalhar embaixo do veículo");
  }
  if (lower.includes("brake")) {
    warnings.push("Teste os freios em local seguro antes de dirigir normalmente");
  }

  return warnings.length > 0 ? warnings : ["Siga todas as precauções de segurança"];
}

function extractVideoUrl(markdown: string, html?: string): string | undefined {
  // Try to find YouTube URLs in markdown
  const youtubePatterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
    /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/g,
  ];

  for (const pattern of youtubePatterns) {
    const match = markdown.match(pattern);
    if (match) {
      return match[0];
    }
  }

  // Try to find in HTML if available
  if (html) {
    for (const pattern of youtubePatterns) {
      const match = html.match(pattern);
      if (match) {
        return match[0];
      }
    }

    // Look for iframe src with YouTube
    const iframeMatch = html.match(/iframe[^>]+src=["']([^"']*youtube[^"']*)/i);
    if (iframeMatch) {
      return iframeMatch[1];
    }

    // Look for video elements
    const videoMatch = html.match(/<video[^>]+src=["']([^"']+)/i);
    if (videoMatch) {
      return videoMatch[1];
    }
  }

  return undefined;
}
