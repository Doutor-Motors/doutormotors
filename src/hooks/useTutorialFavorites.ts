import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UseTutorialFavoritesReturn {
  favorites: Set<string>;
  isLoading: boolean;
  isFavorite: (tutorialId: string) => boolean;
  toggleFavorite: (tutorialId: string) => Promise<void>;
  addFavorite: (tutorialId: string) => Promise<void>;
  removeFavorite: (tutorialId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export function useTutorialFavorites(): UseTutorialFavoritesReturn {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Carregar favoritos do usuário
  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutorial_favorites')
        .select('tutorial_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(new Set(data?.map(f => f.tutorial_id) || []));
    } catch (error) {
      console.error('[useTutorialFavorites] Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carregar favoritos ao montar ou quando usuário mudar
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Verificar se é favorito
  const isFavorite = useCallback((tutorialId: string): boolean => {
    return favorites.has(tutorialId);
  }, [favorites]);

  // Adicionar favorito
  const addFavorite = useCallback(async (tutorialId: string): Promise<void> => {
    if (!user) {
      toast.error('Faça login para salvar favoritos');
      return;
    }

    // Otimistic update
    setFavorites(prev => new Set([...prev, tutorialId]));

    try {
      const { error } = await supabase
        .from('tutorial_favorites')
        .insert({ 
          user_id: user.id, 
          tutorial_id: tutorialId 
        });

      if (error) {
        // Rollback on error
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(tutorialId);
          return next;
        });
        throw error;
      }

      toast.success('Tutorial salvo nos favoritos');
    } catch (error: any) {
      // Verificar se é erro de duplicata
      if (error?.code === '23505') {
        // Já é favorito, manter o estado
        return;
      }
      console.error('[useTutorialFavorites] Error adding favorite:', error);
      toast.error('Erro ao salvar favorito');
    }
  }, [user]);

  // Remover favorito
  const removeFavorite = useCallback(async (tutorialId: string): Promise<void> => {
    if (!user) return;

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(tutorialId);
      return next;
    });

    try {
      const { error } = await supabase
        .from('tutorial_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId);

      if (error) {
        // Rollback on error
        setFavorites(prev => new Set([...prev, tutorialId]));
        throw error;
      }

      toast.success('Tutorial removido dos favoritos');
    } catch (error) {
      console.error('[useTutorialFavorites] Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
    }
  }, [user]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (tutorialId: string): Promise<void> => {
    if (isFavorite(tutorialId)) {
      await removeFavorite(tutorialId);
    } else {
      await addFavorite(tutorialId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    refreshFavorites,
  };
}

export default useTutorialFavorites;
