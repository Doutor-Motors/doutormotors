import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  getCachedResult, 
  setCachedResult 
} from "@/services/solutions/tutorialSearchCache";

export interface RelatedTutorial {
  id: string;
  title: string;
  thumbnail?: string;
  category?: string;
  slug: string;
  score?: number;
}

interface SearchContext {
  keywords?: string[];
  category?: string;
  intent?: string;
}

type LogFn = (level: "info" | "success" | "error" | "warn", operation: string, message: string, details?: string) => void;

export const useRelatedTutorials = (log?: LogFn) => {
  const [relatedTutorials, setRelatedTutorials] = useState<RelatedTutorial[]>([]);
  const [showTutorialSuggestions, setShowTutorialSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchContext, setSearchContext] = useState<SearchContext | null>(null);

  const safeLog = useCallback((
    level: "info" | "success" | "error" | "warn",
    operation: string,
    message: string,
    details?: string
  ) => {
    if (log) log(level, operation, message, details);
  }, [log]);

  const searchRelatedTutorials = async (questionText: string, vehicleContext?: any) => {
    setIsSearching(true);
    safeLog("info", "semanticSearch", `Buscando tutoriais para: "${questionText.slice(0, 50)}..."`);

    // Verificar cache primeiro
    const cached = getCachedResult(questionText, vehicleContext);
    if (cached) {
      safeLog("success", "semanticSearch", `Cache hit! ${cached.tutorials.length} tutoriais do cache`);
      setRelatedTutorials(cached.tutorials);
      setSearchContext(cached.context);
      setShowTutorialSuggestions(cached.tutorials.length > 0);
      setIsSearching(false);
      return;
    }

    safeLog("info", "semanticSearch", "Cache miss, buscando na API...");

    try {
      // First, try semantic search via Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (accessToken) {
        safeLog("info", "semanticSearch", "Usando busca semântica com IA...");
        
        const response = await fetch(
          "https://txxgmxxssnogumcwsfvn.supabase.co/functions/v1/semantic-tutorial-search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              query: questionText,
              vehicleContext,
              limit: 4,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          
          if (result.tutorials && result.tutorials.length > 0) {
            setRelatedTutorials(result.tutorials);
            setSearchContext(result.context || null);
            setShowTutorialSuggestions(true);
            
            // Salvar no cache
            setCachedResult(questionText, result.tutorials, result.context || null, vehicleContext);
            
            safeLog(
              "success", 
              "semanticSearch", 
              `${result.tutorials.length} tutoriais encontrados via IA`,
              result.context ? JSON.stringify(result.context) : undefined
            );
            setIsSearching(false);
            return;
          }
        } else {
          const errorText = await response.text();
          safeLog("warn", "semanticSearch", "Busca semântica falhou, usando fallback", errorText);
        }
      }

      // Fallback: simple keyword search
      safeLog("info", "semanticSearch", "Usando busca por palavras-chave (fallback)...");
      
      const keywords = questionText.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 5);
      
      if (keywords.length === 0) {
        setShowTutorialSuggestions(false);
        safeLog("warn", "semanticSearch", "Nenhuma palavra-chave extraída");
        setIsSearching(false);
        return;
      }
      
      const { data } = await supabase
        .from("tutorial_cache")
        .select("id, title_pt, thumbnail_url, category_pt, slug")
        .or(keywords.map(k => `title_pt.ilike.%${k}%`).join(","))
        .limit(4);
      
      if (data && data.length > 0) {
        setRelatedTutorials(data.map(t => ({
          id: t.id,
          title: t.title_pt || "Tutorial",
          thumbnail: t.thumbnail_url || undefined,
          category: t.category_pt || undefined,
          slug: t.slug,
        })));
        setShowTutorialSuggestions(true);
        safeLog("success", "semanticSearch", `${data.length} tutoriais encontrados (fallback)`);
      } else {
        setShowTutorialSuggestions(false);
        safeLog("info", "semanticSearch", "Nenhum tutorial encontrado");
      }
    } catch (error) {
      console.error("Error searching tutorials:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      safeLog("error", "semanticSearch", "Falha na busca", msg);
      setShowTutorialSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const closeSuggestions = () => {
    setShowTutorialSuggestions(false);
  };

  return {
    relatedTutorials,
    showTutorialSuggestions,
    isSearching,
    searchContext,
    searchRelatedTutorials,
    closeSuggestions,
  };
};
