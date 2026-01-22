/**
 * Health Check Middleware para Edge Functions
 * 
 * Adiciona endpoint /health que retorna status da função
 * 
 * Uso:
 * ```typescript
 * import { handleHealthCheck } from './shared/healthCheck.ts';
 * 
 * Deno.serve(async (req) => {
 *   // Health check endpoint
 *   if (req.url.endsWith('/health')) {
 *     return handleHealthCheck('diagnose', '1.0.0');
 *   }
 *   
 *   // ... resto da lógica
 * });
 * ```
 */

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    function: string;
    version: string;
    timestamp: string;
    uptime?: number;
    dependencies?: {
        [key: string]: 'ok' | 'error';
    };
}

const startTime = Date.now();

export function handleHealthCheck(
    functionName: string,
    version: string = '1.0.0',
    dependencies?: { [key: string]: 'ok' | 'error' }
): Response {
    const uptime = Date.now() - startTime;

    // Verifica se alguma dependência está com erro
    const hasErrors = dependencies && Object.values(dependencies).some(status => status === 'error');

    const response: HealthCheckResponse = {
        status: hasErrors ? 'unhealthy' : 'healthy',
        function: functionName,
        version,
        timestamp: new Date().toISOString(),
        uptime,
        dependencies,
    };

    return new Response(JSON.stringify(response, null, 2), {
        status: hasErrors ? 503 : 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
    });
}

/**
 * Verifica saúde de uma dependência externa
 */
export async function checkDependencyHealth(
    name: string,
    checkFn: () => Promise<boolean>
): Promise<{ name: string; status: 'ok' | 'error' }> {
    try {
        const isHealthy = await Promise.race([
            checkFn(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)), // timeout 5s
        ]);

        return {
            name,
            status: isHealthy ? 'ok' : 'error',
        };
    } catch {
        return {
            name,
            status: 'error',
        };
    }
}
