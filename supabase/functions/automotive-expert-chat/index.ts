import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Especialista Automotivo do Doutor Motors, um assistente técnico amigável e didático especializado em:

1. **Mecânica Automotiva**: Explicar funcionamento de sistemas, componentes e tecnologias de veículos
2. **Diagnóstico Visual**: Analisar fotos de peças, componentes e problemas do veículo
3. **Manutenção Preventiva**: Orientar sobre revisões, trocas de fluidos, peças e cuidados periódicos
4. **Tomada de Decisão**: Auxiliar o usuário a entender se pode resolver sozinho ou precisa de um profissional

DIRETRIZES DE COMUNICAÇÃO:
- Use linguagem simples e acessível, evitando jargões técnicos sem explicação
- Seja didático: explique o "porquê" das coisas, não apenas o "o quê"
- Seja objetivo e organizado, usando listas e passos quando apropriado
- Sempre priorize a segurança do usuário e do veículo
- Deixe claro quando um problema exige avaliação presencial de um mecânico
- Forneça estimativas de custo quando possível (faixas de preço em R$)
- Mencione sinais de alerta que indicam urgência

ANÁLISE DE IMAGENS:
- Quando receber uma foto, analise detalhadamente o que vê
- Identifique peças, componentes, desgaste, danos ou anomalias
- Explique o que está acontecendo e o que pode significar
- Sugira próximos passos baseados na análise visual

LIMITAÇÕES (seja honesto sobre):
- Não pode fazer diagnóstico definitivo sem inspeção física
- Preços variam por região e oficina
- Alguns problemas podem ter múltiplas causas possíveis

FORMATO DAS RESPOSTAS:
- Use markdown para estruturar (títulos, listas, negrito)
- Seja conciso mas completo
- Termine com uma pergunta de acompanhamento quando fizer sentido

CONTEXTO DO VEÍCULO DO USUÁRIO:
{{vehicleContext}}`;

// Search for relevant tutorials based on the conversation
async function searchTutorials(query: string, vehicleContext: any, supabase: any): Promise<any[]> {
  try {
    // Search in carcare_procedure_cache for relevant tutorials
    let searchQuery = supabase
      .from("carcare_procedure_cache")
      .select("*")
      .limit(3);

    // Add vehicle filters if available
    if (vehicleContext?.brand) {
      searchQuery = searchQuery.ilike("brand", `%${vehicleContext.brand}%`);
    }

    // Search by keywords in procedure name
    const keywords = query.toLowerCase().split(" ").filter(w => w.length > 3);
    if (keywords.length > 0) {
      const orConditions = keywords.map(k => `procedure_name_pt.ilike.%${k}%,procedure_name.ilike.%${k}%`).join(",");
      searchQuery = searchQuery.or(orConditions);
    }

    const { data } = await searchQuery;
    
    if (data && data.length > 0) {
      return data.map((t: any) => ({
        id: t.id,
        name: t.procedure_name_pt || t.procedure_name,
        brand: t.brand,
        model: t.model,
        category: t.category,
        url: t.video_url || t.source_url,
        thumbnail: t.thumbnail_url,
      }));
    }

    // Fallback: search in tutorial_cache
    const { data: tutorials } = await supabase
      .from("tutorial_cache")
      .select("id, title_pt, title_original, category_pt, thumbnail_url, video_url, slug")
      .or(keywords.map(k => `title_pt.ilike.%${k}%,title_original.ilike.%${k}%`).join(","))
      .limit(3);

    if (tutorials && tutorials.length > 0) {
      return tutorials.map((t: any) => ({
        id: t.id,
        name: t.title_pt || t.title_original,
        category: t.category_pt,
        url: t.video_url,
        thumbnail: t.thumbnail_url,
        slug: t.slug,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching tutorials:", error);
    return [];
  }
}

// Generate title from first message
function generateTitle(content: string): string {
  const cleaned = content.replace(/[^\w\sáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/g, " ").trim();
  const words = cleaned.split(/\s+/).slice(0, 6);
  return words.join(" ") || "Nova Conversa";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, vehicleContext, conversationId, imageBase64 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Build system prompt with vehicle context
    let systemPrompt = SYSTEM_PROMPT;
    if (vehicleContext) {
      systemPrompt = systemPrompt.replace(
        "{{vehicleContext}}", 
        `O usuário possui: ${vehicleContext.brand} ${vehicleContext.model} ${vehicleContext.year}`
      );
    } else {
      systemPrompt = systemPrompt.replace("{{vehicleContext}}", "Não informado pelo usuário.");
    }

    // Build messages array for AI
    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    for (const msg of messages) {
      if (msg.role === "user" && msg.imageBase64) {
        // Message with image
        aiMessages.push({
          role: "user",
          content: [
            { type: "text", text: msg.content || "Analise esta imagem e me diga o que você vê." },
            { 
              type: "image_url", 
              image_url: { url: msg.imageBase64 }
            }
          ]
        });
      } else {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Search for relevant tutorials based on the last user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    let suggestedTutorials: any[] = [];
    
    if (lastUserMessage && userId) {
      suggestedTutorials = await searchTutorials(lastUserMessage.content, vehicleContext, supabase);
    }

    // Call AI API
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a TransformStream to inject tutorial suggestions at the end
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process the stream
    (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          await writer.write(value);
          
          // Parse response to collect full content
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch {}
            }
          }
        }

        // After stream completes, send tutorial suggestions as a special event
        if (suggestedTutorials.length > 0) {
          const tutorialEvent = `data: ${JSON.stringify({ 
            type: "tutorials", 
            tutorials: suggestedTutorials 
          })}\n\n`;
          await writer.write(encoder.encode(tutorialEvent));
        }

        // Save to database if user is authenticated
        if (userId && lastUserMessage) {
          try {
            let convId = conversationId;
            
            // Create new conversation if needed
            if (!convId) {
              const title = generateTitle(lastUserMessage.content);
              const { data: newConv } = await supabase
                .from("expert_conversations")
                .insert({
                  user_id: userId,
                  title,
                  vehicle_context: vehicleContext,
                })
                .select("id")
                .single();
              
              convId = newConv?.id;
              
              // Send conversation ID to client
              if (convId) {
                const convEvent = `data: ${JSON.stringify({ 
                  type: "conversation", 
                  conversationId: convId 
                })}\n\n`;
                await writer.write(encoder.encode(convEvent));
              }
            }

            // Save messages
            if (convId) {
              // Save user message
              await supabase.from("expert_messages").insert({
                conversation_id: convId,
                role: "user",
                content: lastUserMessage.content,
                image_url: lastUserMessage.imageBase64 ? "image_uploaded" : null,
              });

              // Save assistant response
              await supabase.from("expert_messages").insert({
                conversation_id: convId,
                role: "assistant",
                content: fullResponse,
                suggested_tutorials: suggestedTutorials.length > 0 ? suggestedTutorials : null,
              });
            }
          } catch (dbError) {
            console.error("Error saving to database:", dbError);
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("automotive-expert-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
