import { AiModel } from '@/types'

// Cloud-based Free AI Providers
export const MODEL_CATALOG: AiModel[] = [
  // === OPENROUTER (Free Pool Models) ===
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
    model: 'google/gemma-2-9b-it',
    free: false,
    category: 'text',
    description: 'Fast and efficient Gemma 2 (requires OpenRouter key)',
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
    id: 'claude-3-haiku',
    label: 'Claude 3 Haiku',
    provider: 'openrouter',
    model: 'anthropic/claude-3-haiku',
    free: false,
    category: 'text',
    description: 'Fast and efficient Claude 3 Haiku',
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
  {
    id: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'openrouter',
    model: 'openai/gpt-4-turbo',
    free: false,
    category: 'text',
    description: 'OpenAI\'s GPT-4 Turbo',
    context: 128000,
  },
  {
    id: 'o1-preview',
    label: 'o1 Preview',
    provider: 'openrouter',
    model: 'openai/o1-preview',
    free: false,
    category: 'text',
    description: 'OpenAI\'s o1 reasoning model',
    context: 128000,
    supportsReasoning: true,
  },
  {
    id: 'o1-mini',
    label: 'o1 Mini',
    provider: 'openrouter',
    model: 'openai/o1-mini',
    free: false,
    category: 'text',
    description: 'Fast o1 reasoning model',
    context: 128000,
    supportsReasoning: true,
  },

  // === MISTRAL OFFICIAL ===
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
  {
    id: 'mistral-7b',
    label: 'Mistral 7B (Free)',
    provider: 'openrouter',
    model: 'mistralai/mistral-7b-instruct:free',
    free: true,
    category: 'text',
    description: 'Mistral\'s 7B parameter model',
    context: 32000,
  },

  // === MORE FREE MODELS ===
  {
    id: 'phi-3.5-mini',
    label: 'Phi-3.5 Mini (Free)',
    provider: 'openrouter',
    model: 'microsoft/phi-3.5-mini-128k-instruct:free',
    free: true,
    category: 'text',
    description: 'Microsoft\'s Phi-3.5 Mini',
    context: 128000,
  },
  {
    id: 'aya-23-8b',
    label: 'Aya 23 8B (Free)',
    provider: 'openrouter',
    model: 'coherecommand-r-plus',
    free: true,
    category: 'text',
    description: 'Cohere\'s multilingual model',
    context: 128000,
  },
  {
    id: 'command-r-plus',
    label: 'Command R+',
    provider: 'openrouter',
    model: 'cohere/command-r-plus',
    free: false,
    category: 'text',
    description: 'Cohere\'s advanced model',
    context: 128000,
  },
  {
    id: 'llama-3.2-3b',
    label: 'Llama 3.2 3B (Free)',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    free: true,
    category: 'text',
    description: 'Meta\'s efficient Llama 3.2',
    context: 128000,
  },
  {
    id: 'llama-3.1-8b',
    label: 'Llama 3.1 8B (Free)',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    free: true,
    category: 'text',
    description: 'Meta\'s Llama 3.1 8B',
    context: 128000,
  },

  // === OPENAI DIRECT API ===
  {
    id: 'openai-gpt-4o',
    label: 'GPT-4o (Direct)',
    provider: 'openai',
    model: 'gpt-4o',
    free: false,
    category: 'text',
    description: 'OpenAI\'s flagship multimodal model',
    context: 128000,
  },
  {
    id: 'openai-gpt-4o-mini',
    label: 'GPT-4o Mini (Direct)',
    provider: 'openai',
    model: 'gpt-4o-mini',
    free: false,
    category: 'text',
    description: 'Fast and efficient GPT-4o',
    context: 128000,
  },
  {
    id: 'openai-gpt-4-turbo',
    label: 'GPT-4 Turbo (Direct)',
    provider: 'openai',
    model: 'gpt-4-turbo',
    free: false,
    category: 'text',
    description: 'GPT-4 with improved performance',
    context: 128000,
  },
  {
    id: 'openai-o1',
    label: 'o1 (Direct)',
    provider: 'openai',
    model: 'o1',
    free: false,
    category: 'text',
    description: 'Advanced reasoning model',
    context: 128000,
    supportsReasoning: true,
  },
  {
    id: 'openai-o3-mini',
    label: 'o3 Mini (Direct)',
    provider: 'openai',
    model: 'o3-mini',
    free: false,
    category: 'text',
    description: 'Fast reasoning model',
    context: 128000,
    supportsReasoning: true,
  },

  // === ANTHROPIC DIRECT API ===
  {
    id: 'anthropic-claude-opus-4',
    label: 'Claude Opus 4 (Direct)',
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    free: false,
    category: 'text',
    description: 'Anthropic\'s most powerful model',
    context: 200000,
    supportsReasoning: true,
  },
  {
    id: 'anthropic-claude-sonnet-4',
    label: 'Claude Sonnet 4 (Direct)',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    free: false,
    category: 'text',
    description: 'Balanced performance and efficiency',
    context: 200000,
    supportsReasoning: true,
  },
  {
    id: 'anthropic-claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet (Direct)',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    free: false,
    category: 'text',
    description: 'Latest Claude 3.5 Sonnet',
    context: 200000,
  },
  {
    id: 'anthropic-claude-3.5-haiku',
    label: 'Claude 3.5 Haiku (Direct)',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    free: false,
    category: 'text',
    description: 'Fast and efficient Claude',
    context: 200000,
  },

  // === GROQ (Fast Inference) ===
  {
    id: 'groq-llama-3.3-70b',
    label: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    free: true,
    category: 'text',
    description: 'Ultra-fast inference with Groq',
    context: 128000,
  },
  {
    id: 'groq-llama-3.1-8b',
    label: 'Llama 3.1 8B (Groq)',
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    free: true,
    category: 'text',
    description: 'Instant responses with Groq',
    context: 128000,
  },

  // === TOGETHER AI ===
  {
    id: 'together-llama-3.3-70b',
    label: 'Llama 3.3 70B (Together)',
    provider: 'together',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    free: false,
    category: 'text',
    description: 'Fast open-source inference',
    context: 128000,
  },
  {
    id: 'together-qwen-2.5-72b',
    label: 'Qwen 2.5 72B (Together)',
    provider: 'together',
    model: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    free: false,
    category: 'text',
    description: 'Alibaba\'s Qwen on Together',
    context: 128000,
  },
  {
    id: 'together-deepseek-v3',
    label: 'DeepSeek V3 (Together)',
    provider: 'together',
    model: 'deepseek-ai/DeepSeek-V3',
    free: false,
    category: 'text',
    description: 'DeepSeek\'s latest model',
    context: 64000,
  },

  // === MISTRAL DIRECT API ===
  {
    id: 'mistral-large-latest',
    label: 'Mistral Large (Direct)',
    provider: 'mistral',
    model: 'mistral-large-latest',
    free: false,
    category: 'text',
    description: 'Mistral\'s flagship model',
    context: 128000,
  },
  {
    id: 'mistral-medium-latest',
    label: 'Mistral Medium (Direct)',
    provider: 'mistral',
    model: 'mistral-medium-latest',
    free: false,
    category: 'text',
    description: 'Balanced Mistral model',
    context: 128000,
  },
  {
    id: 'mistral-codestral',
    label: 'Codestral (Direct)',
    provider: 'mistral',
    model: 'codestral-latest',
    free: false,
    category: 'coding',
    description: 'Specialized for coding',
    context: 32000,
  },

  // === PERPLEXITY AI (Web Search & Research) ===
  // Note: sonar-reasoning and sonar-reasoning-pro are deprecated
  // Using only currently supported models
  {
    id: 'perplexity-sonar',
    label: 'Perplexity Sonar',
    provider: 'perplexity',
    model: 'sonar',
    free: false,
    category: 'text',
    description: 'Fast web search with real-time information',
    context: 127072,
    supportsWebSearch: true,
  },
  {
    id: 'perplexity-sonar-pro',
    label: 'Perplexity Sonar Pro',
    provider: 'perplexity',
    model: 'sonar-pro',
    free: false,
    category: 'text',
    description: 'Advanced web search with deeper analysis',
    context: 200000,
    supportsWebSearch: true,
  },
  {
    id: 'perplexity-sonar-deep-research',
    label: 'Perplexity Deep Research',
    provider: 'perplexity',
    model: 'sonar-deep-research',
    free: false,
    category: 'text',
    description: 'Comprehensive multi-step research with citations',
    context: 127072,
    supportsWebSearch: true,
    supportsResearch: true,
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
    (m.description && m.description.toLowerCase().includes(lowerQuery))
  )
}

// Get model by ID
export function getModelById(id: string): AiModel | undefined {
  return MODEL_CATALOG.find(m => m.id === id)
}

// Get models with web search capability
export function getWebSearchModels(): AiModel[] {
  return MODEL_CATALOG.filter(m => m.supportsWebSearch)
}

// Get models with research capability
export function getResearchModels(): AiModel[] {
  return MODEL_CATALOG.filter(m => m.supportsResearch)
}
