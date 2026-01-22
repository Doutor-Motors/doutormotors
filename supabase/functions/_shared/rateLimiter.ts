/**
 * Rate Limiting Middleware para Edge Functions
 * 
 * Limita requisições por:
 * - Usuário autenticado: 10 req/min
 * - IP não autenticado: 5 req/min
 * 
 * Uso:
 * ```typescript
 * import { checkRateLimit } from './shared/rateLimiter.ts';
 * 
 * const { allowed, remaining } = await checkRateLimit({
 *   supabase,
 *   userId: user?.id,
 *   ipAddress: req.headers.get('x-forwarded-for'),
 *   endpoint: 'diagnose',
 *   limit: 10,
 *   windowMinutes: 1,
 * });
 * 
 * if (!allowed) {
 *   return new Response(JSON.stringify({ 
 *     error: 'Rate limit exceeded',
 *     retryAfter: 60 
 *   }), { status: 429 });
 * }
 * ```
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RateLimitConfig {
    supabase: SupabaseClient;
    userId?: string;
    ipAddress?: string | null;
    endpoint: string;
    limit: number;
    windowMinutes: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { supabase, userId, ipAddress, endpoint, limit, windowMinutes } = config;

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    try {
        // Buscar registro existente na janela de tempo
        let query = supabase
            .from('rate_limit_tracking')
            .select('*')
            .eq('endpoint', endpoint)
            .gte('window_start', windowStart.toISOString());

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (ipAddress) {
            query = query.eq('ip_address', ipAddress);
        } else {
            // Sem identificador, bloquear
            return {
                allowed: false,
                remaining: 0,
                resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
            };
        }

        const { data: existing } = await query.maybeSingle();

        if (existing) {
            // Registro existe, verificar limite
            if (existing.request_count >= limit) {
                return {
                    allowed: false,
                    remaining: 0,
                    resetAt: new Date(new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000),
                };
            }

            // Incrementar contador
            await supabase
                .from('rate_limit_tracking')
                .update({
                    request_count: existing.request_count + 1,
                    updated_at: now.toISOString(),
                })
                .eq('id', existing.id);

            return {
                allowed: true,
                remaining: limit - (existing.request_count + 1),
                resetAt: new Date(new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000),
            };
        }

        // Novo registro
        await supabase.from('rate_limit_tracking').insert({
            user_id: userId || null,
            ip_address: ipAddress || null,
            endpoint,
            request_count: 1,
            window_start: now.toISOString(),
        });

        return {
            allowed: true,
            remaining: limit - 1,
            resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // Em caso de erro, permitir (fail-open para não quebrar o serviço)
        return {
            allowed: true,
            remaining: limit,
            resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
        };
    }
}
