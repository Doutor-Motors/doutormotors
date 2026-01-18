import { supabase } from "@/integrations/supabase/client";
import type { 
  Tutorial, 
  TutorialCategory, 
  TutorialStep,
  TutorialDifficulty 
} from '@/types/tutorials';

export interface SearchParams {
  query?: string;
  make?: string;
  model?: string;
  year?: string | number;
  category?: string;
}

export interface SearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

// Helper to parse JSON fields from Supabase
function parseTutorialFromDb(data: any): Tutorial {
  return {
    ...data,
    difficulty: (data.difficulty || 'medium') as TutorialDifficulty,
    steps: Array.isArray(data.steps) ? data.steps : [],
    tools: Array.isArray(data.tools) ? data.tools : [],
    safety_tips: Array.isArray(data.safety_tips) ? data.safety_tips : [],
    vehicle_makes: Array.isArray(data.vehicle_makes) ? data.vehicle_makes : [],
    vehicle_models: Array.isArray(data.vehicle_models) ? data.vehicle_models : [],
    vehicle_years: Array.isArray(data.vehicle_years) ? data.vehicle_years : [],
  };
}

// API Functions
export const tutorialApi = {
  /**
   * Buscar tutoriais no CarCareKiosk
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-proxy', {
        body: { action: 'search', ...params },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.data || [];
    } catch (error) {
      console.error('[tutorialApi.search] Error:', error);
      throw error;
    }
  },

  /**
   * Buscar tutorial completo por URL
   */
  async fetch(url: string): Promise<Tutorial> {
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-proxy', {
        body: { action: 'fetch', url },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return parseTutorialFromDb(data.data);
    } catch (error) {
      console.error('[tutorialApi.fetch] Error:', error);
      throw error;
    }
  },

  /**
   * Buscar todas as categorias
   */
  async getCategories(): Promise<TutorialCategory[]> {
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-proxy', {
        body: { action: 'categories' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.data || [];
    } catch (error) {
      console.error('[tutorialApi.getCategories] Error:', error);
      // Fallback para busca direta no banco
      const { data } = await supabase
        .from('tutorial_categories')
        .select('*')
        .order('name_pt');
      return (data || []) as unknown as TutorialCategory[];
    }
  },

  /**
   * Buscar tutoriais do cache
   */
  async getCached(params: { category?: string; make?: string; limit?: number }): Promise<Tutorial[]> {
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-proxy', {
        body: { action: 'cached', ...params },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return (data.data || []).map(parseTutorialFromDb);
    } catch (error) {
      console.error('[tutorialApi.getCached] Error:', error);
      throw error;
    }
  },

  /**
   * Sincronizar tutoriais para um veículo
   */
  async sync(params: { make: string; model: string; year: string | number }): Promise<{ synced: number; tutorials: Tutorial[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-proxy', {
        body: { action: 'sync', ...params },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return {
        synced: data.data.synced,
        tutorials: (data.data.tutorials || []).map(parseTutorialFromDb),
      };
    } catch (error) {
      console.error('[tutorialApi.sync] Error:', error);
      throw error;
    }
  },

  /**
   * Buscar tutorial por slug (do cache local)
   */
  async getBySlug(slug: string): Promise<Tutorial | null> {
    try {
      const { data, error } = await supabase
        .from('tutorial_cache')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return parseTutorialFromDb(data);
    } catch (error) {
      console.error('[tutorialApi.getBySlug] Error:', error);
      return null;
    }
  },

  /**
   * Incrementar visualizações
   */
  async incrementViews(tutorialId: string): Promise<void> {
    try {
      // Buscar contagem atual e incrementar
      const { data: current } = await supabase
        .from('tutorial_cache')
        .select('views_count')
        .eq('id', tutorialId)
        .single();

      if (current) {
        await supabase
          .from('tutorial_cache')
          .update({ views_count: (current.views_count || 0) + 1 })
          .eq('id', tutorialId);
      }
    } catch (error) {
      console.error('[tutorialApi.incrementViews] Error:', error);
    }
  },

  /**
   * Adicionar aos favoritos
   */
  async addFavorite(tutorialId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tutorial_favorites')
      .insert({ user_id: user.id, tutorial_id: tutorialId });

    if (error) throw error;
  },

  /**
   * Remover dos favoritos
   */
  async removeFavorite(tutorialId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tutorial_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('tutorial_id', tutorialId);

    if (error) throw error;
  },

  /**
   * Verificar se é favorito
   */
  async isFavorite(tutorialId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('tutorial_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tutorial_id', tutorialId)
      .single();

    return !!data;
  },

  /**
   * Buscar favoritos do usuário
   */
  async getFavorites(): Promise<Tutorial[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: favorites, error } = await supabase
      .from('tutorial_favorites')
      .select('tutorial_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !favorites?.length) return [];

    // Buscar tutoriais
    const tutorialIds = favorites.map(f => f.tutorial_id);
    const { data: tutorials } = await supabase
      .from('tutorial_cache')
      .select('*')
      .in('id', tutorialIds);

    return (tutorials || []).map(parseTutorialFromDb);
  },
};

// Hook helper para Deep Linking
export function parseTutorialUrl(pathname: string): { 
  category?: string; 
  slug?: string;
  params: URLSearchParams;
} {
  const params = new URLSearchParams(window.location.search);
  const parts = pathname.split('/').filter(Boolean);
  
  // /estude-seu-carro
  if (parts.length === 1) {
    return { params };
  }
  
  // /estude-seu-carro/tutorial/:slug
  if (parts.length >= 3 && parts[1] === 'tutorial') {
    return { 
      slug: parts.slice(2).join('/'),
      params,
    };
  }
  
  // /estude-seu-carro/:category
  if (parts.length === 2) {
    return { 
      category: parts[1],
      params,
    };
  }
  
  return { params };
}

export default tutorialApi;
