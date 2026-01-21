import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RelatedTutorial {
  id: string;
  title: string;
  thumbnail?: string;
  category?: string;
  slug: string;
}

export const useRelatedTutorials = () => {
  const [relatedTutorials, setRelatedTutorials] = useState<RelatedTutorial[]>([]);
  const [showTutorialSuggestions, setShowTutorialSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRelatedTutorials = async (questionText: string) => {
    setIsSearching(true);
    try {
      // Extract keywords from question
      const keywords = questionText.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 5);
      
      if (keywords.length === 0) {
        setShowTutorialSuggestions(false);
        return;
      }
      
      // Search tutorials by keywords in title or category
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
      } else {
        setShowTutorialSuggestions(false);
      }
    } catch (error) {
      console.error("Error searching tutorials:", error);
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
    searchRelatedTutorials,
    closeSuggestions,
  };
};
