/**
 * Application Constants
 * Centralized configuration for the application
 */

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  STREAMING_TIMEOUT: 120000, // 2 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  BACKOFF_MULTIPLIER: 2,

  // Endpoints
  CHAT_ENDPOINT: '/api/chat',
  OLLAMA_ENDPOINT: '/api/ollama',
  OPENROUTER_ENDPOINT: '/api/openrouter',
  GEMINI_ENDPOINT: '/api/gemini',
  AUTH_ENDPOINT: '/api/auth',

  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  MAX_CONCURRENT_REQUESTS: 5,
}

// ============================================
// Model Configuration
// ============================================

export const MODEL_CONFIG = {
  // Context window limits
  MIN_CONTEXT_TOKENS: 1000,
  MAX_CONTEXT_TOKENS: 128000,
  
  // Output limits
  DEFAULT_MAX_TOKENS: 4000,
  MAX_OUTPUT_TOKENS: 10000,
  MIN_OUTPUT_TOKENS: 100,

  // Temperature ranges
  MIN_TEMPERATURE: 0,
  MAX_TEMPERATURE: 2,
  DEFAULT_TEMPERATURE: 0.7,

  // Top-P ranges
  MIN_TOP_P: 0,
  MAX_TOP_P: 1,
  DEFAULT_TOP_P: 1.0,

  // Model refresh
  CACHE_DURATION: 1000 * 60 * 60 * 24, // 24 hours
  REFRESH_INTERVAL: 1000 * 60 * 60, // 1 hour
}

// ============================================
// Chat Configuration
// ============================================

export const CHAT_CONFIG = {
  // Limits
  MAX_MODELS_PER_CHAT: 5,
  MAX_MESSAGES_PER_CHAT: 1000,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  // Message formatting
  MESSAGE_PREVIEW_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 50000,

  // Display
  MESSAGES_PER_PAGE: 50,
  CONVERSATION_PREVIEW_LINES: 2,

  // Debounce/Throttle
  INPUT_DEBOUNCE_MS: 300,
  TYPING_INDICATOR_DELAY: 500,
}

// ============================================
// Provider Configuration
// ============================================

export const PROVIDER_CONFIG = {
  OPENROUTER: {
    id: 'openrouter',
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1',
    supportsStreaming: true,
    requiresAuth: false, // Free models available
    icon: '🔄',
  },
  GEMINI: {
    id: 'gemini',
    name: 'Google Gemini',
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    supportsStreaming: true,
    requiresAuth: false, // Free tier available
    icon: '🔮',
  },
  OLLAMA: {
    id: 'ollama',
    name: 'Ollama (Local)',
    apiKey: undefined,
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    supportsStreaming: true,
    requiresAuth: false,
    icon: '💻',
  },
}

// ============================================
// UI Configuration
// ============================================

export const UI_CONFIG = {
  // Sidebar
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,

  // Chat area
  CHAT_INPUT_MIN_HEIGHT: 44,
  CHAT_INPUT_MAX_HEIGHT: 200,

  // Animations
  ANIMATION_DURATION: 200, // ms
  TRANSITION_DURATION: 300, // ms

  // Theming
  DARK_MODE: true, // Default to dark mode
  AUTO_DETECT_THEME: true,

  // Breakpoints (from Tailwind)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
}

// ============================================
// Authentication Configuration
// ============================================

export const AUTH_CONFIG = {
  // Session
  SESSION_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  SESSION_UPDATE_INTERVAL: 24 * 60 * 60 * 1000, // 1 day

  // OAuth
  OAUTH_CALLBACK_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  OAUTH_TIMEOUT: 300000, // 5 minutes

  // Password
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false,

  // Bypass auth for development
  BYPASS_AUTH: process.env.NEXT_PUBLIC_BYPASS_AUTH === '1',
}

// ============================================
// Database Configuration
// ============================================

export const DATABASE_CONFIG = {
  // Connection pool
  MIN_CONNECTIONS: 1,
  MAX_CONNECTIONS: 10,

  // Timeouts
  QUERY_TIMEOUT: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 5000, // 5 seconds

  // Batch operations
  BATCH_SIZE: 100,
  BULK_INSERT_SIZE: 1000,

  // Cache
  CACHE_QUERIES: true,
  CACHE_DURATION: 60000, // 1 minute
}

// ============================================
// Error Configuration
// ============================================

export const ERROR_CONFIG = {
  // Logging
  LOG_ERRORS: true,
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB

  // User feedback
  SHOW_TECHNICAL_DETAILS: process.env.NODE_ENV === 'development',
  DEFAULT_ERROR_MESSAGE: 'An unexpected error occurred. Please try again.',

  // Error tracking
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ERROR_TRACKING_ENABLED: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
}

// ============================================
// Feature Flags
// ============================================

export const FEATURE_FLAGS = {
  // Core features
  ENABLE_CHAT: true,
  ENABLE_AUTH: true,
  ENABLE_PERSISTENCE: true,
  ENABLE_SHARING: true,

  // Advanced features
  ENABLE_IMAGE_GENERATION: false, // Coming soon
  ENABLE_WEB_SEARCH: false, // Coming soon
  ENABLE_FILE_UPLOAD: false, // Coming soon
  ENABLE_BATCH_PROCESSING: false, // Coming soon

  // Development features
  ENABLE_DEBUG_PANEL: process.env.NODE_ENV === 'development',
  ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === '1',
}

// ============================================
// Validation Configuration
// ============================================

export const VALIDATION_CONFIG = {
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MAX_LENGTH: 254,

  // URLs
  URL_REGEX: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,

  // API Keys
  API_KEY_MIN_LENGTH: 20,
  API_KEY_MAX_LENGTH: 500,

  // Chat-related
  CHAT_TITLE_MIN_LENGTH: 1,
  CHAT_TITLE_MAX_LENGTH: 100,
  MESSAGE_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 50000,
}

// ============================================
// Performance Configuration
// ============================================

export const PERFORMANCE_CONFIG = {
  // Caching
  ENABLE_CLIENT_CACHE: true,
  ENABLE_SERVER_CACHE: true,
  CACHE_INVALIDATION_TIME: 60000, // 1 minute

  // Optimization
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_CODE_SPLITTING: true,
  ENABLE_PREFETCHING: true,

  // Monitoring
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production',
  PERFORMANCE_THRESHOLD: 3000, // ms - log if slower
}

// ============================================
// Export all configurations
// ============================================

export const CONFIG = {
  API: API_CONFIG,
  MODEL: MODEL_CONFIG,
  CHAT: CHAT_CONFIG,
  PROVIDER: PROVIDER_CONFIG,
  UI: UI_CONFIG,
  AUTH: AUTH_CONFIG,
  DATABASE: DATABASE_CONFIG,
  ERROR: ERROR_CONFIG,
  FEATURES: FEATURE_FLAGS,
  VALIDATION: VALIDATION_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get provider configuration by ID
 */
export function getProviderConfig(providerId: string) {
  return Object.values(PROVIDER_CONFIG).find(p => p.id === providerId)
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature]
}

/**
 * Get API endpoint by provider
 */
export function getProviderEndpoint(providerId: string): string {
  const endpoints: Record<string, string> = {
    openrouter: API_CONFIG.OPENROUTER_ENDPOINT,
    gemini: API_CONFIG.GEMINI_ENDPOINT,
    ollama: API_CONFIG.OLLAMA_ENDPOINT,
  }
  return endpoints[providerId] || API_CONFIG.CHAT_ENDPOINT
}

export default CONFIG
