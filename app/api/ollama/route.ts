import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { messages, model, baseUrl } = await req.json()

    const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434'

    if (!model) {
      return Response.json({ error: 'Model is required for Ollama' }, { status: 400 })
    }

    console.log(`[Ollama] Calling model: ${model} at ${ollamaUrl}`)

    const requestBody = {
      model,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    }

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json(
        { error: 'Ollama API error', details: error },
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

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (!line.trim()) continue
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
        } catch (error) {
          console.error('[Ollama] Stream error:', error)
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
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[Ollama] Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const baseUrl = url.searchParams.get('baseUrl') || process.env.OLLAMA_URL || 'http://localhost:11434'

    const response = await fetch(`${baseUrl}/api/tags`)
    if (!response.ok) {
      return Response.json({ models: [] })
    }

    const data = await response.json()
    const models = (data.models || []).map((m: any) => ({
      id: m.name,
      label: m.name,
      provider: 'ollama',
      model: m.name,
      size: m.size,
      modified_at: m.modified_at,
    }))

    return Response.json({ models })
  } catch (error) {
    console.error('[Ollama] List models error:', error)
    return Response.json({ models: [] })
  }
}
