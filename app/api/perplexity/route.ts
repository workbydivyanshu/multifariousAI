import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { messages, model, apiKey, webSearchEnabled, researchEnabled } = await req.json()

    const key = apiKey || process.env.PERPLEXITY_API_KEY

    if (!key) {
      return Response.json(
        { error: 'Perplexity API key is required. Add it in Settings → API Keys → Perplexity AI' },
        { status: 401 }
      )
    }

    if (!model) {
      return Response.json({ error: 'Model is required' }, { status: 400 })
    }

    // Perplexity API supports web search by default for Sonar models
    // The model itself determines web search vs research capabilities
    const requestBody: any = {
      model,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }

    // Add search options for research-capable models
    if (model.includes('deep-research')) {
      // Deep research mode - comprehensive multi-step research
      requestBody.search_recency_filter = 'month' // Include recent sources
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

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.trim() || line === 'data: [DONE]') continue
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  
                  // Extract content from delta
                  if (data.choices?.[0]?.delta?.content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: data.choices[0].delta.content })}\n\n`)
                    )
                  }
                  
                  // Include citations if available
                  if (data.citations) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ citations: data.citations })}\n\n`)
                    )
                  }
                  
                  if (data.choices?.[0]?.finish_reason) {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    controller.close()
                    return
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('[Perplexity] Stream error:', error)
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
  } catch (error) {
    console.error('[Perplexity] Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
