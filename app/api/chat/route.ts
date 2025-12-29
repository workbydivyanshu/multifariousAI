import { OpenAIStream, StreamingTextResponse } from 'ai'
import { getModelById, getProviderById } from '@/lib/models'

export async function POST(req: Request) {
  try {
    const { modelId, messages } = await req.json()

    if (!modelId || !messages) {
      return new Response('Missing required fields', { status: 400 })
    }

    const model = getModelById(modelId)
    if (!model) {
      return new Response('Model not found', { status: 404 })
    }

    const provider = getProviderById(model.provider.toLowerCase())
    if (!provider) {
      return new Response('Provider not found', { status: 404 })
    }

    if (!provider.apiKey) {
      return new Response('API key not configured for provider', { status: 500 })
    }

    let baseUrl = provider.baseUrl

    if (provider.id === 'openrouter') {
      baseUrl = 'https://openrouter.ai/api/v1'
    } else if (provider.id === 'gemini') {
      baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
        ...(provider.id === 'openrouter' && {
          'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
          'X-Title': 'MultifariousAI',
        }),
      },
      body: JSON.stringify({
        model: model.id,
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('API Error:', error)
      return new Response('Failed to get response from AI', { status: response.status })
    }

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
