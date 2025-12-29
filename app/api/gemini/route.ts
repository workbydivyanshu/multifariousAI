import { NextRequest } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { messages, model, apiKey } = await req.json()

    const key = apiKey || process.env.GEMINI_API_KEY

    if (!key) {
      return Response.json(
        { error: 'Gemini API key is required' },
        { status: 401 }
      )
    }

    if (!model) {
      return Response.json({ error: 'Model is required' }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map((msg: any) => ({
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

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('[Gemini] Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
