// Shared validation schemas using Zod for edge functions
// This module provides type-safe validation for all edge function inputs

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// =============================================================================
// COMMON VALIDATORS
// =============================================================================

export const uuidSchema = z.string().uuid("UUID inválido");
export const emailSchema = z.string().email("Email inválido").max(255, "Email muito longo");
export const safeTextSchema = z.string().max(5000, "Texto muito longo").transform(escapeHtml);
export const shortTextSchema = z.string().max(200, "Texto muito longo").transform(escapeHtml);

// =============================================================================
// CONTACT FORM VALIDATION
// =============================================================================

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .transform(escapeHtml),
  email: emailSchema,
  phone: z
    .string()
    .max(20, "Telefone muito longo")
    .optional()
    .transform((v) => (v ? escapeHtml(v) : undefined)),
  subject: z
    .string()
    .min(3, "Assunto deve ter pelo menos 3 caracteres")
    .max(200, "Assunto muito longo")
    .transform(escapeHtml),
  message: z
    .string()
    .min(10, "Mensagem deve ter pelo menos 10 caracteres")
    .max(5000, "Mensagem muito longa")
    .transform(escapeHtml),
  turnstileToken: z.string().optional(),
  _hp: z.string().optional(), // Honeypot field
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// =============================================================================
// DIAGNOSTIC REQUEST VALIDATION
// =============================================================================

export const diagnosticRequestSchema = z.object({
  dtcCodes: z
    .array(
      z
        .string()
        .regex(/^[A-Z][0-9]{4}$/, "Código DTC inválido (formato: P0123)")
        .max(10, "Código muito longo")
    )
    .min(1, "Pelo menos um código DTC é necessário")
    .max(20, "Máximo de 20 códigos por diagnóstico"),
  vehicleBrand: z.string().min(1, "Marca é obrigatória").max(50, "Marca muito longa"),
  vehicleModel: z.string().min(1, "Modelo é obrigatório").max(50, "Modelo muito longo"),
  vehicleYear: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 2, "Ano inválido"),
  diagnosticId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  vehicleId: uuidSchema.optional(),
});

export type DiagnosticRequestInput = z.infer<typeof diagnosticRequestSchema>;

// =============================================================================
// SOLUTION REQUEST VALIDATION
// =============================================================================

export const solutionRequestSchema = z.object({
  dtcCode: z
    .string()
    .regex(/^[A-Z][0-9]{4}$/, "Código DTC inválido")
    .max(10, "Código muito longo"),
  vehicleBrand: z.string().min(1).max(50),
  vehicleModel: z.string().min(1).max(50),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  problemDescription: z.string().max(1000, "Descrição muito longa").optional(),
});

export type SolutionRequestInput = z.infer<typeof solutionRequestSchema>;

// =============================================================================
// NOTIFICATION REQUEST VALIDATION
// =============================================================================

export const notificationTypes = [
  "critical_diagnostic",
  "diagnostic_completed",
  "ticket_created",
  "ticket_updated",
  "ticket_resolved",
  "account_update",
  "password_changed",
] as const;

export const notificationRequestSchema = z.object({
  type: z.enum(notificationTypes, { errorMap: () => ({ message: "Tipo de notificação inválido" }) }),
  userId: uuidSchema,
  data: z.record(z.unknown()).optional().default({}),
});

export type NotificationRequestInput = z.infer<typeof notificationRequestSchema>;

// =============================================================================
// TUTORIAL SEARCH VALIDATION
// =============================================================================

export const tutorialSearchSchema = z.object({
  query: z.string().max(200, "Query muito longa").optional(),
  category: z.string().max(100).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  vehicleMake: z.string().max(50).optional(),
  vehicleModel: z.string().max(50).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type TutorialSearchInput = z.infer<typeof tutorialSearchSchema>;

// =============================================================================
// SYSTEM ALERT VALIDATION
// =============================================================================

export const systemAlertSchema = z.object({
  title: z.string().min(1).max(200).transform(escapeHtml),
  message: z.string().min(1).max(5000).transform(escapeHtml),
  type: z.enum(["info", "warning", "error", "success"]).optional().default("info"),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
  targetType: z.enum(["all", "specific", "role"]).optional().default("all"),
  targetUserIds: z.array(uuidSchema).optional(),
  targetRole: z.string().max(50).optional(),
  expiresAt: z.string().datetime().optional(),
  sendEmail: z.boolean().optional().default(false),
});

export type SystemAlertInput = z.infer<typeof systemAlertSchema>;

// =============================================================================
// TUTORIAL FETCH VALIDATION
// =============================================================================

export const tutorialFetchSchema = z.object({
  url: z
    .string()
    .url("URL inválida")
    .max(2000, "URL muito longa")
    .refine(
      (url) => {
        // Only allow specific trusted domains
        const trustedDomains = [
          "carcarekiosk.com",
          "youtube.com",
          "youtu.be",
          "www.youtube.com",
          "www.carcarekiosk.com",
        ];
        try {
          const urlObj = new URL(url);
          return trustedDomains.some((d) => urlObj.hostname === d || urlObj.hostname.endsWith(`.${d}`));
        } catch {
          return false;
        }
      },
      { message: "URL não permitida - use apenas fontes confiáveis" }
    ),
  vehicleBrand: z.string().max(50).optional(),
  vehicleModel: z.string().max(50).optional(),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
});

export type TutorialFetchInput = z.infer<typeof tutorialFetchSchema>;

// =============================================================================
// TUTORIAL SEARCH EXTENDED VALIDATION (for search-tutorials function)
// =============================================================================

export const tutorialSearchExtendedSchema = z.object({
  query: z.string().max(200, "Query muito longa").optional().transform((v) => v ? escapeHtml(v) : undefined),
  category: z.string().max(100).optional(),
  vehicleBrand: z.string().max(50).optional(),
  vehicleModel: z.string().max(50).optional(),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
  limit: z.number().int().min(1).max(50).optional().default(12),
});

export type TutorialSearchExtendedInput = z.infer<typeof tutorialSearchExtendedSchema>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return text.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate request body with a Zod schema
 * Returns parsed data or throws validation error
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { data: null, error: errors };
    }

    return { data: result.data, error: null };
  } catch (e) {
    return { data: null, error: "JSON inválido no corpo da requisição" };
  }
}

/**
 * Create standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify({ error: message, success: false }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify({ ...data, success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

/**
 * Rate limiting helper - check if IP should be blocked
 */
export function isRateLimited(
  attempts: number,
  maxAttempts: number,
  windowMinutes: number,
  firstAttemptAt: Date
): boolean {
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();
  const windowStart = firstAttemptAt.getTime();

  // If within window, check attempts
  if (now - windowStart < windowMs) {
    return attempts >= maxAttempts;
  }

  // Window expired, not rate limited
  return false;
}

/**
 * Sanitize user input for safe logging (remove sensitive data)
 */
export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ["password", "token", "secret", "key", "authorization", "cookie"];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 100) {
      sanitized[key] = value.substring(0, 100) + "...";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
