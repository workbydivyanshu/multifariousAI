import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  model: string
  provider: 'openrouter' | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'groq' | 'together' | 'ollama' | 'perplexity'
  apiKey?: string
  baseUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, provider, apiKey, baseUrl } = (await req.json()) as ChatRequest

    if (!model) {
      return Response.json({ error: 'Model is required' }, { status: 400 })
    }

    if (!provider) {
      return Response.json({ error: 'Provider is required' }, { status: 400 })
    }

    let response: Response

    switch (provider) {
      case 'openrouter':
        response = await handleOpenRouter(messages, model, apiKey)
        break
      case 'openai':
        response = await handleOpenAI(messages, model, apiKey)
        break
      case 'anthropic':
        response = await handleAnthropic(messages, model, apiKey)
        break
      case 'gemini':
        response = await handleGemini(messages, model, apiKey)
        break
      case 'mistral':
        response = await handleMistral(messages, model, apiKey)
        break
      case 'groq':
        response = await handleGroq(messages, model, apiKey)
        break
      case 'together':
        response = await handleTogether(messages, model, apiKey)
        break
      case 'ollama':
        response = await handleOllama(messages, model, baseUrl)
        break
      case 'perplexity':
        response = await handlePerplexity(messages, model, apiKey)
        break
      default:
        return Response.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        )
    }

    // Stream the response back to client
    return response
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleOpenRouter(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.OPENROUTER_API_KEY

  if (!key) {
    return Response.json(
      { error: 'OpenRouter API key is required' },
      { status: 401 }
    )
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
      'X-Title': 'MultifariousAI',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.error?.message || 'OpenRouter API error' },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

async function handleOpenAI(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.OPENAI_API_KEY

  if (!key) {
    return Response.json(
      { error: 'OpenAI API key is required' },
      { status: 401 }
    )
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.error?.message || 'OpenAI API error' },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

async function handleAnthropic(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY

  if (!key) {
    return Response.json(
      { error: 'Anthropic API key is required' },
      { status: 401 }
    )
  }

  // Anthropic format requires system message separately
  const systemMessage = messages.find(m => m.role === 'system')
  const otherMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      ...(systemMessage && { system: systemMessage.content }),
      messages: otherMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.error?.message || 'Anthropic API error' },
      { status: response.status }
    )
  }

  return createAnthropicStreamResponse(response)
}

async function handleMistral(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.MISTRAL_API_KEY

  if (!key) {
    return Response.json(
      { error: 'Mistral API key is required' },
      { status: 401 }
    )
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.message || 'Mistral API error' },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

async function handleGroq(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.GROQ_API_KEY

  if (!key) {
    return Response.json(
      { error: 'Groq API key is required' },
      { status: 401 }
    )
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.error?.message || 'Groq API error' },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

async function handleTogether(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.TOGETHER_API_KEY

  if (!key) {
    return Response.json(
      { error: 'Together AI API key is required' },
      { status: 401 }
    )
  }

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.error?.message || 'Together AI API error' },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

async function handleGemini(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.GEMINI_API_KEY

  if (!key) {
    return Response.json(
      { error: 'Gemini API key is required' },
      { status: 401 }
    )
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }],
        })),
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    return Response.json(
      { error: error.error?.message || 'Gemini API error' },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

async function handleOllama(
  messages: Array<{ role: string; content: string }>,
  model: string,
  baseUrl?: string
) {
  const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434'

  console.log(`[Chat API] Calling Ollama model: ${model} at ${ollamaUrl}`)

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return Response.json(
      { error: 'Ollama API error', details: error },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}

function createStreamResponse(response: Response) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.trim() || line === 'data: [DONE]') continue

            // Handle different response formats
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                let content = ''

                // OpenRouter/OpenAI format
                if (data.choices?.[0]?.delta?.content) {
                  content = data.choices[0].delta.content
                }
                // Gemini format
                else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                  content = data.candidates[0].content.parts[0].text
                }

                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  )
                }

                // Check for end conditions
                if (data.choices?.[0]?.finish_reason || data.candidates?.[0]?.finishReason) {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }
              } catch {
                // Skip invalid JSON
              }
            } else {
              // Ollama format (plain JSON lines)
              try {
                const data = JSON.parse(line)
                if (data.message?.content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: data.message.content })}\n\n`)
                  )
                }
                if (data.done) {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error('[Chat API] Stream error:', error)
        controller.error(error)
      } finally {
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function createAnthropicStreamResponse(response: Response) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.trim()) continue

            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                // Anthropic content_block_delta event
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: data.delta.text })}\n\n`)
                  )
                }
                
                // Message complete
                if (data.type === 'message_stop') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error('[Chat API] Anthropic stream error:', error)
        controller.error(error)
      } finally {
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function handlePerplexity(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey?: string
) {
  const key = apiKey || process.env.PERPLEXITY_API_KEY

  if (!key) {
    return Response.json(
      { error: 'Perplexity API key is required. Add it in Settings → API Keys → Perplexity AI' },
      { status: 401 }
    )
  }

  const requestBody: any = {
    model,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    stream: true,
  }

  // Add search options for research-capable models
  if (model.includes('deep-research')) {
    requestBody.search_recency_filter = 'month'
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    let errorMessage = 'Perplexity API error'
    try {
      const error = await response.json()
      errorMessage = error.error?.message || error.detail || errorMessage
    } catch {
      // If we can't parse the error, use the default message
    }
    return Response.json(
      { error: errorMessage },
      { status: response.status }
    )
  }

  return createStreamResponse(response)
}
