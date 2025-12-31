'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '@/stores/chat-store'

// Provider configurations for fetching models
const PROVIDERS = [
  { id: 'openrouter', keyName: 'openrouter' },
  { id: 'openai', keyName: 'openai' },
  { id: 'anthropic', keyName: 'anthropic' },
  { id: 'gemini', keyName: 'gemini' },
  { id: 'mistral', keyName: 'mistral' },
  { id: 'groq', keyName: 'groq' },
  { id: 'together', keyName: 'together' },
  { id: 'ollama', keyName: 'ollamaUrl' },
  { id: 'perplexity', keyName: 'perplexity' },
]

// This component initializes models on app load for all existing API keys
export function ModelInitializer() {
  const { providerKeys, setFetchedModels, fetchedModels } = useChatStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    const initializeModels = async () => {
      const providersToFetch = PROVIDERS.filter(provider => {
        const key = (providerKeys as any)[provider.keyName]
        const hasKey = key && key.length > 0
        const noModels = !fetchedModels[provider.id] || fetchedModels[provider.id].length === 0
        return hasKey && noModels
      })

      // Fetch models for all providers in parallel
      await Promise.allSettled(
        providersToFetch.map(async (provider) => {
          const key = (providerKeys as any)[provider.keyName]
          try {
            const response = await fetch('/api/models', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ provider: provider.id, apiKey: key }),
            })
            
            if (response.ok) {
              const { models } = await response.json()
              if (models && models.length > 0) {
                setFetchedModels(provider.id, models)
              }
            }
          } catch (error) {
            console.error(`Failed to initialize models for ${provider.id}:`, error)
          }
        })
      )
      
      setInitialized(true)
    }

    // Small delay to ensure hydration is complete
    const timer = setTimeout(initializeModels, 100)
    return () => clearTimeout(timer)
  }, [initialized, providerKeys, fetchedModels, setFetchedModels])

  return null // This component doesn't render anything
}
