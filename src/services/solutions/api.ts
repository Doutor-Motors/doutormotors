import { supabase } from "@/integrations/supabase/client";
import { 
  getCachedSolution, 
  setCachedSolution, 
  generateCacheKey,
  cleanExpiredCache 
} from "./cache";

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
  fromCache?: boolean;
}

// Limpa cache expirado periodicamente
let cacheCleanupDone = false;
async function ensureCacheCleanup() {
  if (!cacheCleanupDone) {
    cacheCleanupDone = true;
    try {
      await cleanExpiredCache();
    } catch (e) {
      console.warn("Erro ao limpar cache expirado:", e);
    }
  }
}

export async function fetchSolutionFromCarCareKiosk(
  params: FetchSolutionParams,
  options?: { forceRefresh?: boolean }
): Promise<FetchSolutionResponse> {
  // Garante limpeza de cache expirado
  ensureCacheCleanup();

  const cacheKey = generateCacheKey(
    params.dtcCode,
    params.vehicleBrand,
    params.vehicleModel,
    params.vehicleYear
  );

  try {
    // 1. Tenta buscar do cache local primeiro (a menos que forceRefresh)
    if (!options?.forceRefresh) {
      const cached = await getCachedSolution(cacheKey);
      if (cached) {
        console.log("✅ Solução encontrada no cache local:", cacheKey);
        return {
          success: true,
          solution: cached.solution,
          fromCache: true,
        };
      }
    } else {
      console.log("🔄 Refresh forçado solicitado, ignorando cache:", cacheKey);
    }

    console.log("🔄 Buscando do servidor:", cacheKey);

    // 2. Se não está no cache, busca da edge function
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

    const response = data as FetchSolutionResponse;

    // 3. Se sucesso, salva no cache para uso futuro
    if (response.success && response.solution) {
      try {
        await setCachedSolution(
          cacheKey,
          response.solution,
          {
            brand: params.vehicleBrand,
            model: params.vehicleModel,
            year: params.vehicleYear,
          },
          params.dtcCode
        );
        console.log("💾 Solução salva no cache:", cacheKey);
      } catch (cacheError) {
        console.warn("Erro ao salvar no cache (não crítico):", cacheError);
      }
    }

    return {
      ...response,
      fromCache: false,
    };
  } catch (err) {
    console.error("Error fetching solution:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
