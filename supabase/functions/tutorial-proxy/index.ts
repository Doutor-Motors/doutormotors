import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de categorias EN -> PT
const CATEGORY_MAP: Record<string, string> = {
  'brakes': 'Freios',
  'brake': 'Freios',
  'suspension': 'Suspensão',
  'engine': 'Motor',
  'electrical': 'Elétrica',
  'electric': 'Elétrica',
  'transmission': 'Transmissão',
  'cooling': 'Sistema de Arrefecimento',
  'cooling-system': 'Sistema de Arrefecimento',
  'exhaust': 'Escapamento',
  'steering': 'Direção',
  'interior': 'Interior',
  'exterior': 'Exterior',
  'maintenance': 'Manutenção',
  'oil': 'Óleo',
  'fuel': 'Sistema de Combustível',
  'fuel-system': 'Sistema de Combustível',
  'air-conditioning': 'Ar Condicionado',
  'ac': 'Ar Condicionado',
  'hvac': 'Ar Condicionado',
  'battery': 'Bateria',
  'alternator': 'Alternador',
  'starter': 'Motor de Arranque',
  'lights': 'Iluminação',
  'lighting': 'Iluminação',
  'wipers': 'Limpadores',
  'windshield': 'Para-brisa',
  'tires': 'Pneus',
  'wheels': 'Rodas',
  'body': 'Carroceria',
};

// Função para traduzir categoria
function translateCategory(category: string): string {
  const normalized = category.toLowerCase().replace(/[_\s]+/g, '-');
  return CATEGORY_MAP[normalized] || category;
}

// Função para extrair YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Função para gerar slug a partir de URL
function generateSlug(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  } catch {
    return url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }
}

// Função para fazer scraping via Firecrawl
async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<any> {
  console.log('[Firecrawl] Scraping URL:', url);
  
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 3000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Firecrawl] Error:', response.status, error);
    throw new Error(`Firecrawl error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Firecrawl] Success, got data');
  return data;
}

// Função para buscar tutoriais via Firecrawl Search
async function searchTutorials(query: string, apiKey: string): Promise<any[]> {
  console.log('[Firecrawl] Searching:', query);
  
  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `site:carcarekiosk.com ${query}`,
      limit: 20,
      scrapeOptions: {
        formats: ['markdown'],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Firecrawl] Search error:', response.status, error);
    return [];
  }

  const data = await response.json();
  console.log('[Firecrawl] Search results:', data.data?.length || 0);
  return data.data || [];
}

// Função para traduzir texto usando Lovable AI
async function translateText(text: string, lovableApiKey: string): Promise<string> {
  if (!text || text.trim() === '') return '';
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Você é um tradutor especializado em mecânica automotiva. Traduza o texto para português brasileiro de forma natural e técnica. Retorne APENAS a tradução, sem explicações.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('[Translation] Error:', response.status);
      return text;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('[Translation] Failed:', error);
    return text;
  }
}

// Função para extrair passos do conteúdo
async function extractSteps(markdown: string, lovableApiKey: string): Promise<any[]> {
  if (!markdown || markdown.trim() === '') return [];
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em mecânica automotiva. Extraia os passos do tutorial do conteúdo fornecido.
            
Retorne um JSON array com objetos contendo:
- "step": número do passo (1, 2, 3...)
- "title": título curto do passo em português
- "description": descrição detalhada do passo em português
- "tools": array de ferramentas necessárias (em português)
- "tips": dicas de segurança ou observações importantes (em português)
- "timestamp": tempo aproximado no vídeo se mencionado (formato "MM:SS")

Retorne APENAS o JSON array, sem markdown ou explicações.`,
          },
          {
            role: 'user',
            content: markdown.substring(0, 8000), // Limitar tamanho
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('[ExtractSteps] Error:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '[]';
    
    // Tentar parsear JSON
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('[ExtractSteps] Failed to parse JSON');
    }
    
    return [];
  } catch (error) {
    console.error('[ExtractSteps] Failed:', error);
    return [];
  }
}

// Função para processar tutorial completo
async function processTutorial(
  url: string, 
  firecrawlKey: string, 
  lovableKey: string,
  supabase: any
): Promise<any> {
  const slug = generateSlug(url);
  
  // Verificar cache primeiro
  const { data: cached } = await supabase
    .from('tutorial_cache')
    .select('*')
    .eq('slug', slug)
    .eq('is_processed', true)
    .single();
  
  if (cached) {
    console.log('[Cache] Hit for:', slug);
    return cached;
  }
  
  // Fazer scraping
  const scraped = await scrapeWithFirecrawl(url, firecrawlKey);
  const markdown = scraped.data?.markdown || scraped.markdown || '';
  const html = scraped.data?.html || scraped.html || '';
  
  if (!markdown && !html) {
    throw new Error('No content extracted from URL');
  }
  
  // Extrair informações básicas
  const titleMatch = markdown.match(/^#\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1] : url.split('/').pop() || 'Tutorial';
  
  // Extrair URL do vídeo YouTube
  const youtubeMatch = html.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const youtubeId = youtubeMatch ? youtubeMatch[1] : null;
  
  // Extrair categoria da URL
  const categoryMatch = url.match(/carcarekiosk\.com\/video\/([^\/]+)/);
  const categoryOriginal = categoryMatch ? categoryMatch[1] : 'maintenance';
  
  // Traduzir título
  const titlePt = await translateText(title, lovableKey);
  
  // Extrair e traduzir descrição
  const descMatch = markdown.match(/^(?!#).{50,500}$/m);
  const descOriginal = descMatch ? descMatch[0] : '';
  const descPt = await translateText(descOriginal, lovableKey);
  
  // Extrair passos
  const steps = await extractSteps(markdown, lovableKey);
  
  // Extrair ferramentas dos passos
  const tools = [...new Set(steps.flatMap((s: any) => s.tools || []))];
  
  // Salvar no cache
  const tutorial = {
    slug,
    source_url: url,
    title_original: title,
    title_pt: titlePt,
    description_original: descOriginal,
    description_pt: descPt,
    category_original: categoryOriginal,
    category_pt: translateCategory(categoryOriginal),
    youtube_video_id: youtubeId,
    video_url: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null,
    thumbnail_url: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null,
    steps,
    tools,
    is_processed: true,
    last_synced_at: new Date().toISOString(),
  };
  
  const { data: saved, error } = await supabase
    .from('tutorial_cache')
    .upsert(tutorial, { onConflict: 'slug' })
    .select()
    .single();
  
  if (error) {
    console.error('[Cache] Save error:', error);
  }
  
  return saved || tutorial;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    // Get API keys
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }
    
    if (!lovableKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    let result: any;
    
    switch (action) {
      case 'search': {
        // Buscar tutoriais
        const { query, make, model, year, category } = params;
        
        let searchQuery = query || '';
        if (make) searchQuery += ` ${make}`;
        if (model) searchQuery += ` ${model}`;
        if (year) searchQuery += ` ${year}`;
        if (category) searchQuery += ` ${category}`;
        
        const results = await searchTutorials(searchQuery.trim(), firecrawlKey);
        
        // Processar resultados básicos
        result = results.map((r: any) => ({
          url: r.url,
          title: r.title || r.url.split('/').pop(),
          description: r.description || '',
          markdown: r.markdown?.substring(0, 500),
        }));
        break;
      }
      
      case 'fetch': {
        // Buscar tutorial completo
        const { url } = params;
        if (!url) throw new Error('URL is required');
        
        result = await processTutorial(url, firecrawlKey, lovableKey, supabase);
        break;
      }
      
      case 'categories': {
        // Retornar categorias
        const { data: categories } = await supabase
          .from('tutorial_categories')
          .select('*')
          .order('name_pt');
        
        result = categories || [];
        break;
      }
      
      case 'cached': {
        // Buscar do cache por filtros
        const { category, make, limit = 20 } = params;
        
        let query = supabase
          .from('tutorial_cache')
          .select('*')
          .eq('is_processed', true)
          .order('last_synced_at', { ascending: false })
          .limit(limit);
        
        if (category) {
          query = query.eq('category_pt', category);
        }
        
        if (make) {
          query = query.contains('vehicle_makes', [make]);
        }
        
        const { data } = await query;
        result = data || [];
        break;
      }
      
      case 'sync': {
        // Sincronizar tutoriais populares
        const { make, model, year } = params;
        
        // Buscar tutoriais para o veículo
        const searchQuery = `${make} ${model} ${year} repair tutorial`;
        const results = await searchTutorials(searchQuery, firecrawlKey);
        
        // Processar os primeiros 5
        const processed = [];
        for (const r of results.slice(0, 5)) {
          try {
            const tutorial = await processTutorial(r.url, firecrawlKey, lovableKey, supabase);
            processed.push(tutorial);
          } catch (e) {
            console.error('[Sync] Failed to process:', r.url, e);
          }
        }
        
        result = { synced: processed.length, tutorials: processed };
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[tutorial-proxy] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
