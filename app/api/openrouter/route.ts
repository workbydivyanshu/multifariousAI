import { NextRequest } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { messages, model, apiKey } = await req.json()

    const key = apiKey || process.env.OPENROUTER_API_KEY

    if (!key) {
      return Response.json(
        { error: 'OpenRouter API key is required' },
        { status: 401 }
      )
    }

    if (!model) {
      return Response.json({ error: 'Model is required' }, { status: 400 })
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
        messages: messages.map((msg: any) => ({
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

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('[OpenRouter] Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
