import { MODEL_CATALOG, getFreeModels } from '@/lib/models'
import { AiModel } from '@/types'
import { useChatStore } from '@/stores/chat-store'

export function useModels() {
  const { customModels, providerKeys } = useChatStore()

  const hasOpenRouterKey = providerKeys.openrouter || process.env.OPENROUTER_API_KEY
  const hasGeminiKey = providerKeys.gemini || process.env.GEMINI_API_KEY
  const hasOllama = providerKeys.ollamaUrl || process.env.OLLAMA_URL

  const allModels = [...MODEL_CATALOG, ...customModels]

  const availableModels = allModels.filter((model) => {
    if (model.free) return true

    if (model.provider === 'openrouter' && !hasOpenRouterKey) return false
    if (model.provider === 'gemini' && !hasGeminiKey) return false
    if (model.provider === 'ollama' && !hasOllama) return false
    if (model.provider === 'mistral' && !hasOpenRouterKey) return false

    return true
  })

  return {
    models: availableModels,
    freeModels: getFreeModels(),
    customModels,
  }
}

export async function fetchOllamaModels(baseUrl?: string): Promise<AiModel[]> {
  try {
    const url = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434'
    const response = await fetch(`${url}/api/tags`)
    if (!response.ok) return []

    const data = await response.json()
    return (data.models || []).map((m: any) => ({
      id: m.name,
      label: m.name,
      provider: 'ollama',
      model: m.name,
      category: 'text',
      description: `Ollama model (${m.size})`,
      context: 32000,
    }))
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error)
    return []
  }
}
