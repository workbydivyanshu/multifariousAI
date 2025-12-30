'use client'

import { useCallback } from 'react'
import { parseApiError, getUserFriendlyMessage, logError } from '@/lib/error-handler'
import { useToast } from '@/lib/use-toast'

export interface UseFetchOptions {
  showErrorToast?: boolean
  logErrors?: boolean
  context?: string
}

export function useFetch() {
  const { error: showErrorToast } = useToast()

  const fetchWithError = useCallback(
    async (
      url: string,
      options?: RequestInit & UseFetchOptions
    ): Promise<Response | null> => {
      const { showErrorToast: shouldShowToast = true, logErrors: shouldLog = true, context = 'API Call', ...fetchOptions } = options || {}

      try {
        const response = await fetch(url, fetchOptions)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          const apiError = parseApiError(errorData)
          apiError.status = response.status

          if (shouldLog) {
            logError(context, apiError)
          }

          if (shouldShowToast) {
            const message = getUserFriendlyMessage(apiError)
            showErrorToast(message)
          }

          return null
        }

        return response
      } catch (error) {
        const apiError = parseApiError(error)

        if (shouldLog) {
          logError(context, apiError)
        }

        if (shouldShowToast) {
          const message = getUserFriendlyMessage(apiError)
          showErrorToast(message)
        }

        return null
      }
    },
    [showErrorToast]
  )

  return { fetchWithError }
}
