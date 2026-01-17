/**
 * Sistema de cache local para soluções traduzidas
 * Usa IndexedDB para persistência eficiente
 */

const DB_NAME = 'loveble-solutions-cache';
const DB_VERSION = 1;
const STORE_NAME = 'solutions';
const CACHE_EXPIRY_DAYS = 30; // Soluções expiram após 30 dias

interface CachedSolution {
  id: string;
  solution: {
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
  };
  cachedAt: number;
  expiresAt: number;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
  };
  dtcCode: string;
}

/**
 * Gera uma chave única para o cache baseada no veículo e código DTC
 */
export function generateCacheKey(
  dtcCode: string,
  vehicleBrand: string,
  vehicleModel: string,
  vehicleYear: number
): string {
  const normalizedKey = `${dtcCode}-${vehicleBrand}-${vehicleModel}-${vehicleYear}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return normalizedKey;
}

/**
 * Abre conexão com IndexedDB
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Erro ao abrir cache de soluções:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Cria object store se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('dtcCode', 'dtcCode', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });
}

/**
 * Busca solução do cache
 */
export async function getCachedSolution(cacheKey: string): Promise<CachedSolution | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cacheKey);

      request.onerror = () => {
        console.error('Erro ao buscar cache:', request.error);
        resolve(null);
      };

      request.onsuccess = () => {
        const cached = request.result as CachedSolution | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Verifica se expirou
        if (Date.now() > cached.expiresAt) {
          console.log('Cache expirado para:', cacheKey);
          // Remove entrada expirada
          deleteCachedSolution(cacheKey).catch(console.error);
          resolve(null);
          return;
        }

        console.log('Cache hit para:', cacheKey);
        resolve(cached);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erro ao acessar cache:', error);
    return null;
  }
}

/**
 * Salva solução no cache
 */
export async function setCachedSolution(
  cacheKey: string,
  solution: CachedSolution['solution'],
  vehicleInfo: CachedSolution['vehicleInfo'],
  dtcCode: string
): Promise<void> {
  try {
    const db = await openDatabase();
    
    const cachedSolution: CachedSolution = {
      id: cacheKey,
      solution,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      vehicleInfo,
      dtcCode,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cachedSolution);

      request.onerror = () => {
        console.error('Erro ao salvar cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Solução cacheada com sucesso:', cacheKey);
        resolve();
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erro ao salvar no cache:', error);
  }
}

/**
 * Remove solução do cache
 */
export async function deleteCachedSolution(cacheKey: string): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(cacheKey);

      request.onerror = () => {
        console.error('Erro ao deletar cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Cache removido:', cacheKey);
        resolve();
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erro ao deletar do cache:', error);
  }
}

/**
 * Limpa todo o cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        console.error('Erro ao limpar cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Cache limpo com sucesso');
        resolve();
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

/**
 * Limpa entradas expiradas do cache
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const db = await openDatabase();
    const now = Date.now();
    let deletedCount = 0;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onerror = () => {
        console.error('Erro ao limpar cache expirado:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        console.log(`${deletedCount} entradas expiradas removidas`);
        db.close();
        resolve(deletedCount);
      };
    });
  } catch (error) {
    console.error('Erro ao limpar cache expirado:', error);
    return 0;
  }
}

/**
 * Retorna estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
  totalSize: string;
}> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();
      const allRequest = store.getAll();

      let totalEntries = 0;
      let entries: CachedSolution[] = [];

      countRequest.onsuccess = () => {
        totalEntries = countRequest.result;
      };

      allRequest.onsuccess = () => {
        entries = allRequest.result;
      };

      transaction.oncomplete = () => {
        db.close();

        if (entries.length === 0) {
          resolve({
            totalEntries: 0,
            oldestEntry: null,
            newestEntry: null,
            totalSize: '0 KB',
          });
          return;
        }

        const sortedByDate = entries.sort((a, b) => a.cachedAt - b.cachedAt);
        const sizeInBytes = new Blob([JSON.stringify(entries)]).size;
        const sizeFormatted = sizeInBytes > 1024 * 1024 
          ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
          : `${(sizeInBytes / 1024).toFixed(2)} KB`;

        resolve({
          totalEntries,
          oldestEntry: new Date(sortedByDate[0].cachedAt),
          newestEntry: new Date(sortedByDate[sortedByDate.length - 1].cachedAt),
          totalSize: sizeFormatted,
        });
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      totalSize: '0 KB',
    };
  }
}

/**
 * Constante para limite de aviso do cache
 */
export const CACHE_WARNING_THRESHOLD = 80;

/**
 * Verifica se o cache está quase cheio
 */
export async function isCacheAlmostFull(): Promise<{ isFull: boolean; count: number }> {
  const stats = await getCacheStats();
  return {
    isFull: stats.totalEntries >= CACHE_WARNING_THRESHOLD,
    count: stats.totalEntries,
  };
}
