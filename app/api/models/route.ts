import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    let models: any[] = []

    switch (provider) {
      case 'openrouter':
        models = await fetchOpenRouterModels(apiKey)
        break
      case 'openai':
        models = await fetchOpenAIModels(apiKey)
        break
      case 'anthropic':
        models = await fetchAnthropicModels(apiKey)
        break
      case 'gemini':
        models = await fetchGeminiModels(apiKey)
        break
      case 'mistral':
        models = await fetchMistralModels(apiKey)
        break
      case 'groq':
        models = await fetchGroqModels(apiKey)
        break
      case 'together':
        models = await fetchTogetherModels(apiKey)
        break
      case 'ollama':
        models = await fetchOllamaModels(apiKey) // apiKey is the base URL for Ollama
        break
      case 'perplexity':
        models = await fetchPerplexityModels(apiKey)
        break
      default:
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    return NextResponse.json({ models })
  } catch (error: any) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

async function fetchOpenRouterModels(apiKey: string) {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch OpenRouter models')
  }

  const data = await response.json()
  return data.data?.map((model: any) => ({
    id: `openrouter-${model.id.replace(/\//g, '-')}`,
    label: model.name || model.id,
    provider: 'openrouter',
    model: model.id,
    description: model.description || `Context: ${model.context_length || 'N/A'}`,
    context: model.context_length || 4096,
    category: 'text',
  })) || []
}

async function fetchOpenAIModels(apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch OpenAI models')
  }

  const data = await response.json()
  // Filter to only show GPT models
  const gptModels = data.data?.filter((model: any) => 
    model.id.includes('gpt') || model.id.includes('o1') || model.id.includes('o3')
  ) || []

  return gptModels.map((model: any) => ({
    id: `openai-${model.id}`,
    label: model.id,
    provider: 'openai',
    model: model.id,
    description: `OpenAI ${model.id}`,
    context: model.id.includes('128k') ? 128000 : model.id.includes('32k') ? 32768 : 8192,
    category: 'text',
  }))
}

async function fetchAnthropicModels(apiKey: string) {
  // Anthropic doesn't have a public models list API, return known models
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    }),
  })

  // If request succeeds or fails with model error, the key is valid
  if (response.ok || response.status === 400) {
    return [
      { id: 'anthropic-claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', description: 'Most intelligent Claude model', context: 200000, category: 'text' },
      { id: 'anthropic-claude-3-5-haiku', label: 'Claude 3.5 Haiku', provider: 'anthropic', model: 'claude-3-5-haiku-20241022', description: 'Fast and efficient', context: 200000, category: 'text' },
      { id: 'anthropic-claude-3-opus', label: 'Claude 3 Opus', provider: 'anthropic', model: 'claude-3-opus-20240229', description: 'Most powerful Claude 3', context: 200000, category: 'text' },
    ]
  }

  throw new Error('Invalid Anthropic API key')
}

async function fetchGeminiModels(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Gemini models')
  }

  const data = await response.json()
  return data.models
    ?.filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model: any) => ({
      id: `gemini-${model.name.replace('models/', '')}`,
      label: model.displayName || model.name.replace('models/', ''),
      provider: 'gemini',
      model: model.name.replace('models/', ''),
      description: model.description || 'Google Gemini model',
      context: model.inputTokenLimit || 32768,
      category: 'text',
    })) || []
}

async function fetchMistralModels(apiKey: string) {
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Mistral models')
  }

  const data = await response.json()
  return data.data?.map((model: any) => ({
    id: `mistral-${model.id}`,
    label: model.id,
    provider: 'mistral',
    model: model.id,
    description: `Mistral ${model.id}`,
    context: model.max_context_length || 32768,
    category: 'text',
  })) || []
}

async function fetchGroqModels(apiKey: string) {
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Groq models')
  }

  const data = await response.json()
  return data.data?.map((model: any) => ({
    id: `groq-${model.id}`,
    label: model.id,
    provider: 'groq',
    model: model.id,
    description: `Groq ${model.id} - Ultra-fast inference`,
    context: model.context_window || 8192,
    category: 'text',
  })) || []
}

async function fetchTogetherModels(apiKey: string) {
  const response = await fetch('https://api.together.xyz/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Together models')
  }

  const data = await response.json()
  // Filter to only chat models
  const chatModels = data?.filter((model: any) => 
    model.type === 'chat' || model.display_type === 'chat'
  ) || []

  return chatModels.map((model: any) => ({
    id: `together-${model.id.replace(/\//g, '-')}`,
    label: model.display_name || model.id,
    provider: 'together',
    model: model.id,
    description: model.description || `Together AI model`,
    context: model.context_length || 4096,
    category: 'text',
  }))
}

async function fetchOllamaModels(baseUrl: string) {
  const url = baseUrl || 'http://localhost:11434'
  const response = await fetch(`${url}/api/tags`)

  if (!response.ok) {
    throw new Error('Failed to fetch Ollama models. Is Ollama running?')
  }

  const data = await response.json()
  return data.models?.map((model: any) => ({
    id: `ollama-${model.name.replace(/:/g, '-')}`,
    label: model.name,
    provider: 'ollama',
    model: model.name,
    description: `Local model - ${(model.size / 1e9).toFixed(1)}GB`,
    context: 4096,
    category: 'text',
  })) || []
}

async function fetchPerplexityModels(apiKey: string) {
  // Perplexity doesn't have a models list API, return known models after validating key
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 1,
    }),
  })

  if (response.ok || response.status === 400) {
    return [
      { id: 'perplexity-sonar-small', label: 'Sonar Small (Online)', provider: 'perplexity', model: 'llama-3.1-sonar-small-128k-online', description: 'Fast web search', context: 128000, category: 'text' },
      { id: 'perplexity-sonar-large', label: 'Sonar Large (Online)', provider: 'perplexity', model: 'llama-3.1-sonar-large-128k-online', description: 'Powerful web search', context: 128000, category: 'text' },
      { id: 'perplexity-sonar-huge', label: 'Sonar Huge (Online)', provider: 'perplexity', model: 'llama-3.1-sonar-huge-128k-online', description: 'Most capable web search', context: 128000, category: 'text' },
      { id: 'perplexity-sonar-deep-research', label: 'Sonar Deep Research', provider: 'perplexity', model: 'sonar-deep-research', description: 'Deep research mode', context: 128000, category: 'text' },
    ]
  }

  throw new Error('Invalid Perplexity API key')
}
