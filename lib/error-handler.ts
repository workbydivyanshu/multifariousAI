/**
 * Utility for handling errors and providing user-friendly messages
 */

export interface ApiError {
  message: string
  status?: number
  details?: string
}

export function parseApiError(error: unknown): ApiError {
  // Handle Error instances
  if (error instanceof Error) {
    return {
      message: error.message || 'Unknown error occurred',
      details: error.stack,
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error || 'Unknown error occurred',
    }
  }

  // Handle object errors with message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>
    
    // Try various common error message properties
    const message = errorObj.message || errorObj.error || errorObj.msg || errorObj.detail
    
    if (message) {
      return {
        message: String(message),
        status: typeof errorObj.status === 'number' ? errorObj.status : undefined,
        details: errorObj.details ? String(errorObj.details) : undefined,
      }
    }
    
    // Try to stringify the error object for debugging
    try {
      const stringified = JSON.stringify(error)
      if (stringified && stringified !== '{}') {
        return {
          message: `Error: ${stringified}`,
        }
      }
    } catch {
      // Ignore stringify errors
    }
  }

  return {
    message: 'An unexpected error occurred',
  }
}

export function getUserFriendlyMessage(error: ApiError): string {
  const statusCode = error.status

  // Specific error messages for common scenarios
  if (statusCode === 401) {
    return 'Authentication failed. Please check your API key.'
  }

  if (statusCode === 402) {
    return 'API quota exceeded. Please check your account and billing.'
  }

  if (statusCode === 403) {
    return 'Access denied. Please check your permissions.'
  }

  if (statusCode === 404) {
    return 'The requested resource was not found.'
  }

  if (statusCode === 429) {
    return 'Too many requests. Please try again in a moment.'
  }

  if (statusCode === 500) {
    return 'Server error. Please try again later.'
  }

  if (statusCode === 503) {
    return 'Service temporarily unavailable. Please try again later.'
  }

  // Check for specific error keywords
  if (error.message.toLowerCase().includes('api key')) {
    return 'Invalid or missing API key. Please configure your credentials.'
  }

  if (error.message.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection.'
  }

  if (error.message.toLowerCase().includes('timeout')) {
    return 'Request timeout. The server took too long to respond.'
  }

  if (error.message.toLowerCase().includes('model')) {
    return 'Model error. Please check the selected model.'
  }

  if (error.message.toLowerCase().includes('no endpoints found')) {
    return 'That model is temporarily unavailable with the current provider.'
  }

  if (error.message.toLowerCase().includes('ollama')) {
    return 'Ollama connection failed. Please ensure Ollama is running.'
  }

  // Default fallback
  return error.message || 'An unexpected error occurred. Please try again.'
}

export function logError(context: string, error: ApiError) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    message: error.message,
    status: error.status,
    details: error.details,
  }
  console.error(`[${timestamp}] ${context}:`, errorInfo.message || 'Unknown error', errorInfo)

  // In production, you could send this to an error tracking service
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: send to Sentry, LogRocket, etc.
  }
}
