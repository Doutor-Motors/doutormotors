// Cache Statistics Tracker
// Utility to track cache hit/miss rates for monitoring

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type CacheType = 'tutorial' | 'procedure' | 'transcription' | 'solution' | 'system';
export type CacheOperation = 'hit' | 'miss' | 'expired' | 'evicted' | 'cleanup';

interface CacheStatEntry {
  cache_type: string;
  operation: string;
  key_identifier?: string;
  metadata?: Json;
}

// Queue for batch inserts
let statQueue: CacheStatEntry[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL_MS = 5000; // Flush every 5 seconds
const MAX_QUEUE_SIZE = 50;

/**
 * Track a cache operation (hit, miss, etc.)
 * Queues the operation for batch insert to minimize DB calls
 */
export function trackCacheOperation(
  cacheType: CacheType,
  operation: CacheOperation,
  keyIdentifier?: string,
  metadata?: Record<string, unknown>
): void {
  // Convert metadata to Json-compatible format
  const jsonMetadata: Json | undefined = metadata 
    ? JSON.parse(JSON.stringify(metadata)) 
    : undefined;
  statQueue.push({
    cache_type: cacheType,
    operation,
    key_identifier: keyIdentifier,
    metadata: jsonMetadata,
  });

  // Flush if queue is full
  if (statQueue.length >= MAX_QUEUE_SIZE) {
    flushCacheStats();
  } else if (!flushTimeout) {
    // Schedule flush
    flushTimeout = setTimeout(flushCacheStats, FLUSH_INTERVAL_MS);
  }
}

/**
 * Flush queued cache statistics to database
 */
async function flushCacheStats(): Promise<void> {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (statQueue.length === 0) return;

  const entries = [...statQueue];
  statQueue = [];

  try {
    // Use service role client would be ideal, but for client-side
    // we'll try to insert - it will fail silently if not authorized
    const { error } = await supabase
      .from('cache_statistics')
      .insert(entries);

    if (error) {
      // Expected to fail from client - stats are mainly tracked server-side
      console.debug('[CacheStats] Client insert skipped (expected):', error.code);
    }
  } catch (err) {
    // Silent fail for client-side - stats are tracked server-side
    console.debug('[CacheStats] Flush error (expected from client)');
  }
}

/**
 * Track cache hit
 */
export function trackHit(cacheType: CacheType, key?: string): void {
  trackCacheOperation(cacheType, 'hit', key);
}

/**
 * Track cache miss
 */
export function trackMiss(cacheType: CacheType, key?: string): void {
  trackCacheOperation(cacheType, 'miss', key);
}

/**
 * Track cache expiration
 */
export function trackExpired(cacheType: CacheType, key?: string): void {
  trackCacheOperation(cacheType, 'expired', key);
}

/**
 * Get cache statistics summary (admin only)
 */
export async function getCacheStatsSummary(days: number = 7): Promise<{
  success: boolean;
  data?: Array<{
    cache_type: string;
    date: string;
    hits: number;
    misses: number;
    hit_rate_percent: number;
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('cache_statistics_summary')
      .select('*')
      .limit(days * 10); // Rough estimate of rows

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Get recent cache statistics (admin only)
 */
export async function getRecentCacheStats(limit: number = 100): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    cache_type: string;
    operation: string;
    key_identifier: string | null;
    created_at: string;
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('cache_statistics')
      .select('id, cache_type, operation, key_identifier, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (statQueue.length > 0) {
      // Use sendBeacon for reliable delivery on unload
      const entries = statQueue.map(e => ({
        cache_type: e.cache_type,
        operation: e.operation,
        key_identifier: e.key_identifier,
        metadata: e.metadata,
      }));
      
      // Can't use supabase client in sendBeacon, so just log
      console.debug('[CacheStats] Page unload with pending stats:', entries.length);
    }
  });
}
