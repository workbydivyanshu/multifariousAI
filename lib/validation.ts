/**
 * Request Validation & Security Utilities
 * Industry-standard input validation, SSRF protection, and sanitization
 */

import { z } from 'zod'

// ============================================
// SSRF Protection - Ollama URL Validation
// ============================================

// Allowlisted hostnames for Ollama connections
const OLLAMA_ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  // Add your internal Ollama hosts here if needed
]

// Allowlisted private network prefixes (for advanced users)
const PRIVATE_NETWORK_PREFIXES = [
  '10.',
  '172.16.', '172.17.', '172.18.', '172.19.',
  '172.20.', '172.21.', '172.22.', '172.23.',
  '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
  '192.168.',
]

export function isValidOllamaUrl(urlString: string): { valid: boolean; error?: string; sanitizedUrl?: string } {
  try {
    // Default to localhost if empty
    if (!urlString || urlString.trim() === '') {
      return { valid: true, sanitizedUrl: 'http://localhost:11434' }
    }

    const url = new URL(urlString)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Invalid protocol. Only http and https are allowed.' }
    }

    // Block file:// and other dangerous protocols
    if (url.protocol === 'file:') {
      return { valid: false, error: 'File protocol is not allowed.' }
    }

    const hostname = url.hostname.toLowerCase()

    // Check against allowlist
    const isAllowedHost = OLLAMA_ALLOWED_HOSTS.includes(hostname)
    const isPrivateNetwork = PRIVATE_NETWORK_PREFIXES.some(prefix => hostname.startsWith(prefix))

    // In production, you may want to be more restrictive
    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction) {
      // Production: only localhost allowed unless explicitly configured
      if (!isAllowedHost) {
        return { 
          valid: false, 
          error: 'In production, only localhost Ollama connections are allowed.' 
        }
      }
    } else {
      // Development: allow localhost and private networks
      if (!isAllowedHost && !isPrivateNetwork) {
        return { 
          valid: false, 
          error: 'Only localhost and private network Ollama hosts are allowed.' 
        }
      }
    }

    // Block common cloud metadata endpoints (SSRF attack vectors)
    const blockedHosts = [
      '169.254.169.254', // AWS/GCP/Azure metadata
      'metadata.google.internal',
      'metadata.google.com',
      '100.100.100.200', // Alibaba Cloud
    ]
    
    if (blockedHosts.includes(hostname)) {
      return { valid: false, error: 'Access to this host is not allowed.' }
    }

    // Return sanitized URL (removes auth, fragments, etc.)
    const sanitizedUrl = `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, '')
    return { valid: true, sanitizedUrl }

  } catch (e) {
    return { valid: false, error: 'Invalid URL format.' }
  }
}

// ============================================
// Zod Schemas for API Validation
// ============================================

// Message schema
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content is required').max(100000, 'Message too long'),
})

// Valid providers
const ProviderSchema = z.enum([
  'openrouter', 'openai', 'anthropic', 'gemini', 
  'mistral', 'groq', 'together', 'ollama', 'perplexity'
])

// Chat request schema
export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1, 'At least one message is required').max(100, 'Too many messages'),
  model: z.string().min(1, 'Model is required').max(200, 'Model name too long'),
  provider: ProviderSchema,
  apiKey: z.string().max(500).optional(),
  baseUrl: z.string().max(500).optional(),
  // Optional features
  webSearchEnabled: z.boolean().optional(),
  researchEnabled: z.boolean().optional(),
  reasoningEnabled: z.boolean().optional(),
})

// Models fetch request schema
export const ModelsRequestSchema = z.object({
  provider: ProviderSchema,
  apiKey: z.string().max(500).optional(),
})

// Generic validation function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; data: T 
} | { 
  success: false; error: string 
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Format Zod errors nicely
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
  return { success: false, error: errors }
}

// ============================================
// API Key Redaction for Logging
// ============================================

const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,        // OpenAI/Anthropic style keys
  /sk-or-v1-[a-zA-Z0-9]+/g,       // OpenRouter keys
  /pplx-[a-zA-Z0-9]+/g,           // Perplexity keys
  /gsk_[a-zA-Z0-9]+/g,            // Groq keys
  /AIza[a-zA-Z0-9_-]+/g,          // Google API keys
  /api[_-]?key[=:]["']?[a-zA-Z0-9_-]+["']?/gi,
  /bearer\s+[a-zA-Z0-9_-]+/gi,
]

export function redactSensitiveData(input: string): string {
  let output = input
  
  for (const pattern of SENSITIVE_PATTERNS) {
    output = output.replace(pattern, '[REDACTED]')
  }
  
  return output
}

export function redactObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return redactSensitiveData(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(redactObject)
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const redacted: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Completely redact known sensitive keys
      if (['apiKey', 'api_key', 'apikey', 'authorization', 'token', 'password', 'secret'].includes(key.toLowerCase())) {
        redacted[key] = '[REDACTED]'
      } else {
        redacted[key] = redactObject(value)
      }
    }
    return redacted
  }
  
  return obj
}

// ============================================
// Rate Limiting Types (for future implementation)
// ============================================

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// Simple in-memory rate limiter (for single-instance deployments)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string, 
  config: RateLimitConfig = { maxRequests: 60, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: new Date(now + config.windowMs) }
  }
  
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt) }
  }
  
  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetAt: new Date(record.resetAt) }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

// ============================================
// Request ID Generation
// ============================================

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

// ============================================
// Structured Logging Helper
// ============================================

export interface LogContext {
  requestId?: string
  provider?: string
  model?: string
  userId?: string
  duration?: number
  status?: number
}

export function structuredLog(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: LogContext,
  error?: unknown
) {
  const timestamp = new Date().toISOString()
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
    ...(error ? { error: redactObject(error) } : {}),
  }
  
  const logString = JSON.stringify(logEntry)
  
  switch (level) {
    case 'error':
      console.error(logString)
      break
    case 'warn':
      console.warn(logString)
      break
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.debug(logString)
      }
      break
    default:
      console.log(logString)
  }
}
