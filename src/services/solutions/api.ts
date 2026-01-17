import { supabase } from "@/integrations/supabase/client";

export interface FetchedSolution {
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  estimatedCost: string;
  difficulty: number;
  tools: string[];
  parts: string[];
  warnings: string[];
  professionalRecommended: boolean;
  sourceUrl: string;
}

export interface FetchSolutionParams {
  dtcCode: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  problemDescription: string;
}

export interface FetchSolutionResponse {
  success: boolean;
  solution?: FetchedSolution;
  error?: string;
}

export async function fetchSolutionFromCarCareKiosk(
  params: FetchSolutionParams
): Promise<FetchSolutionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("fetch-solution", {
      body: params,
    });

    if (error) {
      console.error("Error calling fetch-solution:", error);
      return {
        success: false,
        error: error.message || "Erro ao buscar solução",
      };
    }

    return data as FetchSolutionResponse;
  } catch (err) {
    console.error("Error fetching solution:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
