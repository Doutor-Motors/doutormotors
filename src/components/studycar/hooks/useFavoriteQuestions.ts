import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

export interface FavoriteQuestion {
  id: string;
  question_text: string;
  question_icon: string;
  question_color: string;
  question_gradient: string;
  usage_count: number;
}

export interface PopularQuestion {
  question_text: string;
  question_icon: string;
  question_color: string;
  question_gradient: string;
  total_usage: number;
  unique_users: number;
}

export const useFavoriteQuestions = () => {
  const { user } = useAuth();
  const { notifySuccess } = useNotifications();
  
  const [favoriteQuestions, setFavoriteQuestions] = useState<FavoriteQuestion[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<PopularQuestion[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("expert_favorite_questions")
        .select("*")
        .eq("user_id", user.id)
        .order("usage_count", { ascending: false })
        .limit(6);
      
      if (data) {
        setFavoriteQuestions(data);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, [user]);

  const loadPopularQuestions = useCallback(async () => {
    setIsLoadingPopular(true);
    try {
      const { data, error } = await supabase
        .from("popular_questions_ranking")
        .select("*")
        .limit(10);
      
      if (error) {
        console.error("Error loading popular questions:", error);
        return;
      }
      
      if (data) {
        setPopularQuestions(data as PopularQuestion[]);
      }
    } catch (error) {
      console.error("Error loading popular questions:", error);
    } finally {
      setIsLoadingPopular(false);
    }
  }, []);

  const saveQuestionAsFavorite = async (
    text: string, 
    icon: string, 
    color: string, 
    gradient: string
  ) => {
    if (!user) return;
    
    try {
      // Try to update existing, otherwise insert
      const { data: existing } = await supabase
        .from("expert_favorite_questions")
        .select("id, usage_count")
        .eq("user_id", user.id)
        .eq("question_text", text)
        .single();
      
      if (existing) {
        await supabase
          .from("expert_favorite_questions")
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("expert_favorite_questions")
          .insert({
            user_id: user.id,
            question_text: text,
            question_icon: icon,
            question_color: color,
            question_gradient: gradient,
          });
      }
      
      loadFavorites();
    } catch (error) {
      console.error("Error saving favorite:", error);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      await supabase
        .from("expert_favorite_questions")
        .delete()
        .eq("id", id);
      
      setFavoriteQuestions(prev => prev.filter(f => f.id !== id));
      notifySuccess("Removida", "Pergunta removida dos favoritos");
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return {
    favoriteQuestions,
    popularQuestions,
    isLoadingPopular,
    loadFavorites,
    loadPopularQuestions,
    saveQuestionAsFavorite,
    removeFavorite,
  };
};
