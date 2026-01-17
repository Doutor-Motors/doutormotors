import { supabase } from "@/integrations/supabase/client";

export interface Tutorial {
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

export interface TutorialContent {
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

export interface SearchTutorialsParams {
  query?: string;
  category?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  limit?: number;
}

export interface SearchTutorialsResponse {
  success: boolean;
  tutorials?: Tutorial[];
  error?: string;
}

export interface FetchTutorialResponse {
  success: boolean;
  content?: TutorialContent;
  error?: string;
}

export async function searchTutorials(
  params: SearchTutorialsParams
): Promise<SearchTutorialsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("search-tutorials", {
      body: params,
    });

    if (error) {
      console.error("Error searching tutorials:", error);
      return { success: false, error: error.message };
    }

    return data as SearchTutorialsResponse;
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchTutorialContent(
  url: string,
  vehicle?: { brand: string; model: string; year: number }
): Promise<FetchTutorialResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("fetch-tutorial", {
      body: {
        url,
        vehicleBrand: vehicle?.brand,
        vehicleModel: vehicle?.model,
        vehicleYear: vehicle?.year,
      },
    });

    if (error) {
      console.error("Error fetching tutorial:", error);
      return { success: false, error: error.message };
    }

    return data as FetchTutorialResponse;
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export const TUTORIAL_CATEGORIES = [
  { id: "motor", name: "Motor", icon: "⚙️", description: "Óleo, filtros e manutenção do motor" },
  { id: "freios", name: "Freios", icon: "🛑", description: "Pastilhas, discos e sistema de frenagem" },
  { id: "eletrica", name: "Elétrica", icon: "⚡", description: "Bateria, luzes e sistema elétrico" },
  { id: "suspensao", name: "Suspensão", icon: "🔧", description: "Amortecedores e componentes" },
  { id: "transmissao", name: "Transmissão", icon: "🔄", description: "Câmbio, embreagem e fluidos" },
  { id: "arrefecimento", name: "Arrefecimento", icon: "❄️", description: "Radiador, termostato e coolant" },
  { id: "escapamento", name: "Escapamento", icon: "💨", description: "Catalisador, escapamento e emissões" },
  { id: "direcao", name: "Direção", icon: "🎯", description: "Direção hidráulica e elétrica" },
];

export function getCategoryById(id: string) {
  return TUTORIAL_CATEGORIES.find(cat => cat.id === id);
}

export function getDifficultyColor(difficulty?: string): string {
  switch (difficulty?.toLowerCase()) {
    case "fácil":
    case "easy":
      return "bg-green-500";
    case "difícil":
    case "difficult":
    case "hard":
      return "bg-red-500";
    default:
      return "bg-yellow-500";
  }
}

export function getDifficultyLabel(difficulty?: string): string {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "Fácil";
    case "intermediate":
      return "Intermediário";
    case "difficult":
    case "hard":
      return "Difícil";
    default:
      return difficulty || "Intermediário";
  }
}
