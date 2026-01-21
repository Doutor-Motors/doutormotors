/**
 * Cache local para resultados de busca semântica de tutoriais
 * Usa sessionStorage para persistência durante a sessão
 */

import type { RelatedTutorial } from "@/components/studycar/hooks/useRelatedTutorials";

interface CacheEntry {
  tutorials: RelatedTutorial[];
  context: {
    keywords?: string[];
    category?: string;
    intent?: string;
  } | null;
  timestamp: number;
  vehicleKey?: string;
}

interface CacheStore {
  [queryHash: string]: CacheEntry;
}

const CACHE_KEY = "tutorial_semantic_search_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos
const MAX_CACHE_ENTRIES = 50;

/**
 * Gera um hash simples para a query + veículo
 */
function generateCacheKey(query: string, vehicleContext?: { brand?: string; model?: string; year?: number }): string {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, " ");
  const vehicleKey = vehicleContext 
    ? `${vehicleContext.brand || ""}-${vehicleContext.model || ""}-${vehicleContext.year || ""}`
    : "no-vehicle";
  return `${normalized}::${vehicleKey}`;
}

/**
 * Carrega o cache do sessionStorage
 */
function loadCache(): CacheStore {
  try {
    const stored = sessionStorage.getItem(CACHE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as CacheStore;
  } catch {
    return {};
  }
}

/**
 * Salva o cache no sessionStorage
 */
function saveCache(cache: CacheStore): void {
  try {
    // Limitar número de entradas
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHE_ENTRIES) {
      // Remover entradas mais antigas
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toKeep = entries.slice(-MAX_CACHE_ENTRIES);
      cache = Object.fromEntries(toKeep);
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Se sessionStorage estiver cheio, limpar cache
    console.warn("Failed to save tutorial search cache:", error);
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignorar
    }
  }
}

/**
 * Busca resultado no cache
 */
export function getCachedResult(
  query: string,
  vehicleContext?: { brand?: string; model?: string; year?: number }
): CacheEntry | null {
  const key = generateCacheKey(query, vehicleContext);
  const cache = loadCache();
  const entry = cache[key];

  if (!entry) return null;

  // Verificar se expirou
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    // Remover entrada expirada
    delete cache[key];
    saveCache(cache);
    return null;
  }

  return entry;
}

/**
 * Armazena resultado no cache
 */
export function setCachedResult(
  query: string,
  tutorials: RelatedTutorial[],
  context: CacheEntry["context"],
  vehicleContext?: { brand?: string; model?: string; year?: number }
): void {
  const key = generateCacheKey(query, vehicleContext);
  const cache = loadCache();

  cache[key] = {
    tutorials,
    context,
    timestamp: Date.now(),
    vehicleKey: vehicleContext 
      ? `${vehicleContext.brand} ${vehicleContext.model} ${vehicleContext.year}`.trim()
      : undefined,
  };

  saveCache(cache);
}

/**
 * Limpa todo o cache
 */
export function clearTutorialSearchCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignorar
  }
}

/**
 * Retorna estatísticas do cache
 */
export function getCacheStats(): { entries: number; oldestMs: number | null; newestMs: number | null } {
  const cache = loadCache();
  const entries = Object.values(cache);
  
  if (entries.length === 0) {
    return { entries: 0, oldestMs: null, newestMs: null };
  }

  const timestamps = entries.map(e => e.timestamp);
  return {
    entries: entries.length,
    oldestMs: Math.min(...timestamps),
    newestMs: Math.max(...timestamps),
  };
}
