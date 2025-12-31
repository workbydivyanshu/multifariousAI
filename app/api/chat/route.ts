import { NextRequest } from 'next/server'
import { 
  ChatRequestSchema, 
  validateRequest, 
  isValidOllamaUrl, 
  checkRateLimit,
  generateRequestId,
  structuredLog 
} from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  try {
    // Rate limiting by IP - allow 500 requests per minute for multi-model queries
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateLimit = checkRateLimit(`chat:${clientIp}`, { maxRequests: 500, windowMs: 60000 })
    
    if (!rateLimit.allowed) {
      structuredLog('warn', 'Rate limit exceeded', { requestId, status: 429 })
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          }
        }
      )
    }

    const body = await req.json()
    
    // Validate request with Zod schema
    const validation = validateRequest(ChatRequestSchema, body)
    if (!validation.success) {
      structuredLog('warn', 'Invalid request', { requestId, status: 400 }, { error: validation.error })
      return Response.json({ error: validation.error }, { status: 400 })
    }
    
    const { messages, model, provider, apiKey, baseUrl } = validation.data
    
    structuredLog('info', 'Chat request received', { requestId, provider, model })

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
  } catch (error: any) {
    console.error('[Chat API] Error:', error?.message || error)
    
    // Return more specific error message
    const errorMessage = error?.message || 'Internal server error'
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('network')
    
    return Response.json(
      { error: isNetworkError ? 'Failed to connect to AI provider. Please try again.' : errorMessage },
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
  // SSRF Protection: Validate Ollama URL
  const urlValidation = isValidOllamaUrl(baseUrl || '')
  if (!urlValidation.valid) {
    return Response.json(
      { error: urlValidation.error || 'Invalid Ollama URL' },
      { status: 400 }
    )
  }
  
  const ollamaUrl = urlValidation.sanitizedUrl!

  structuredLog('debug', 'Calling Ollama', { provider: 'ollama', model })

  // Add timeout with AbortController
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

  try {
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
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      return Response.json(
        { error: 'Ollama API error', details: error },
        { status: response.status }
      )
    }

    return createStreamResponse(response)
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return Response.json(
        { error: 'Request timed out. Ollama may be overloaded or unreachable.' },
        { status: 504 }
      )
    }
    throw error
  }
}

// Process a single SSE line and return true if stream should close
function processLine(
  line: string, 
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): boolean {
  // Handle SSE format (data: {...})
  if (line.startsWith('data: ')) {
    const jsonStr = line.slice(6)
    if (jsonStr === '[DONE]') return true
    
    try {
      const data = JSON.parse(jsonStr)
      let content = ''

      // OpenRouter/OpenAI format
      if (data.choices?.[0]?.delta?.content) {
        content = data.choices[0].delta.content
      }
      // Gemini format
      else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        content = data.candidates[0].content.parts[0].text
      }
      // Anthropic format
      else if (data.delta?.text) {
        content = data.delta.text
      }

      if (content) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
        )
      }

      // Check for end conditions
      if (data.choices?.[0]?.finish_reason || 
          data.candidates?.[0]?.finishReason ||
          data.type === 'message_stop') {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        return true
      }
    } catch {
      // Skip invalid JSON - could be partial line
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
        return true
      }
    } catch {
      // Skip invalid JSON
    }
  }
  return false
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

      // Buffer for incomplete lines (handles chunk boundaries correctly)
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            // Process any remaining buffered content
            if (buffer.trim()) {
              processLine(buffer.trim(), controller, encoder)
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            break
          }

          // Append to buffer and split by newlines
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // Keep the last (potentially incomplete) line in buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
            
            const shouldClose = processLine(trimmedLine, controller, encoder)
            if (shouldClose) {
              controller.close()
              return
            }
          }
        }
      } catch (error) {
        structuredLog('error', 'Stream processing error', {}, error)
        controller.error(error)
      } finally {
        reader.releaseLock()
        controller.close()
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
