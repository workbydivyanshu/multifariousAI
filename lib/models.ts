import { AiModel } from './types'

// Cloud-based Free AI Providers
export const MODEL_CATALOG: AiModel[] = [
  // === OPENROUTER (Free Pool Models) ===
  {
    id: 'deepseek-r1',
    label: 'DeepSeek R1 (Free)',
    provider: 'openrouter',
    model: 'deepseek/deepseek-r1:free',
    free: true,
    category: 'text',
    description: 'Advanced reasoning model with free tier',
    context: 64000,
  },
  {
    id: 'llama-3.3-70b',
    label: 'Llama 3.3 70B (Free)',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    free: true,
    category: 'text',
    description: 'Meta\'s latest Llama model',
    context: 128000,
  },
  {
    id: 'qwen-2.5-72b',
    label: 'Qwen 2.5 72B (Free)',
    provider: 'openrouter',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    free: true,
    category: 'text',
    description: 'Alibaba\'s powerful reasoning model',
    context: 32768,
  },
  {
    id: 'mistral-small-24b',
    label: 'Mistral Small 24B (Free)',
    provider: 'openrouter',
    model: 'mistralai/mistral-small-24b-instruct-2501:free',
    free: true,
    category: 'text',
    description: 'Efficient and fast from Mistral',
    context: 32000,
  },
  {
    id: 'gemma-3-27b',
    label: 'Gemma 3 27B (Free)',
    provider: 'openrouter',
    model: 'google/gemma-3-27b-it:free',
    free: true,
    category: 'text',
    description: 'Google\'s Gemma 3 model',
    context: 128000,
  },
  {
    id: 'gemma-2-9b',
    label: 'Gemma 2 9B (Free)',
    provider: 'openrouter',
    model: 'google/gemma-2-9b-it:free',
    free: true,
    category: 'text',
    description: 'Fast and efficient Gemma 2',
    context: 8192,
  },
  {
    id: 'glm-4.5-air',
    label: 'GLM 4.5 Air (Free)',
    provider: 'openrouter',
    model: 'z-ai/glm-4.5-air:free',
    free: true,
    category: 'text',
    description: 'Zhipu AI\'s GLM model',
    context: 128000,
  },
  {
    id: 'hunyuan-a13b',
    label: 'Tencent Hunyuan A13B (Free)',
    provider: 'openrouter',
    model: 'tencent/hunyuan-a13b-instruct:free',
    free: true,
    category: 'text',
    description: 'Tencent\'s open-source model',
    context: 32768,
  },
  {
    id: 'moonshot-kimi-k2',
    label: 'Moonshot Kimi K2 (Free)',
    provider: 'openrouter',
    model: 'moonshotai/kimi-k2:free',
    free: true,
    category: 'text',
    description: 'Moonshot AI\'s Kimi model',
    context: 32000,
  },
  {
    id: 'reka-flash-3',
    label: 'Reka Flash 3 (Free)',
    provider: 'openrouter',
    model: 'reka/reka-flash-3:free',
    free: true,
    category: 'text',
    description: 'Reka\'s efficient model',
    context: 128000,
  },
  {
    id: 'deepcoder-14b',
    label: 'DeepCoder 14B (Free)',
    provider: 'openrouter',
    model: 'agentica-org/deepcoder-14b-preview:free',
    free: true,
    category: 'coding',
    description: 'Specialized coding model',
    context: 32000,
  },

  // === GEMINI (Google) ===
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    free: false,
    category: 'text',
    description: 'Google\'s latest fast model',
    context: 1000000,
  },
  {
    id: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    free: false,
    category: 'text',
    description: 'Google\'s most capable model',
    context: 2800000,
  },
  {
    id: 'gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash Image',
    provider: 'openrouter',
    model: 'google/gemini-2.5-flash-image-preview:free',
    free: true,
    category: 'image',
    description: 'Image generation with Gemini',
    context: 1000000,
  },

  // === PAID OPENROUTER MODELS (User API Key) ===
  {
    id: 'claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    model: 'anthropic/claude-3.5-sonnet',
    free: false,
    category: 'text',
    description: 'Anthropic\'s latest Claude',
    context: 200000,
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openrouter',
    model: 'openai/gpt-4o',
    free: false,
    category: 'text',
    description: 'OpenAI\'s GPT-4o',
    context: 128000,
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    free: false,
    category: 'text',
    description: 'Fast and efficient GPT-4o Mini',
    context: 128000,
  },

  // === MISTRRAL OFFICIAL ===
  {
    id: 'mistral-large',
    label: 'Mistral Large',
    provider: 'mistral',
    model: 'mistral-large-latest',
    free: false,
    category: 'text',
    description: 'Mistral\'s flagship model',
    context: 128000,
  },
  {
    id: 'codestral',
    label: 'Codestral',
    provider: 'mistral',
    model: 'codestral-latest',
    free: false,
    category: 'coding',
    description: 'Specialized coding model',
    context: 32000,
  },
]

// Get models by category
export function getModelsByCategory(category?: string): AiModel[] {
  if (!category) return MODEL_CATALOG
  return MODEL_CATALOG.filter(m => m.category === category)
}

// Get free models only
export function getFreeModels(): AiModel[] {
  return MODEL_CATALOG.filter(m => m.free)
}

// Get models by provider
export function getModelsByProvider(provider: string): AiModel[] {
  return MODEL_CATALOG.filter(m => m.provider === provider)
}

// Search models
export function searchModels(query: string): AiModel[] {
  const lowerQuery = query.toLowerCase()
  return MODEL_CATALOG.filter(m =>
    m.label.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery)
  )
}

// Get model by ID
export function getModelById(id: string): AiModel | undefined {
  return MODEL_CATALOG.find(m => m.id === id)
}
