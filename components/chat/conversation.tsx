'use client'

import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { useChatStore } from '@/stores/chat-store'
import { getModelById } from '@/lib/models'

interface ConversationProps {
  modelId: string
  threadId: string
}

export function Conversation({ modelId, threadId }: ConversationProps) {
  const { threads, addMessage, setStreaming, providerKeys, isStreaming } = useChatStore()
  const currentThread = threads.find(t => t.id === threadId)
  const model = getModelById(modelId)

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!threadId || !model) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: Date.now(),
      attachments,
    }

    addMessage(threadId, userMessage)
    setStreaming(true)

    const messages = [...(currentThread?.messages || []), userMessage]

    try {
      let apiUrl: string
      let body: any = { messages, model: model.model }

      if (model.provider === 'ollama') {
        apiUrl = '/api/ollama'
        body.baseUrl = providerKeys.ollamaUrl || process.env.OLLAMA_URL
      } else if (model.provider === 'openrouter') {
        apiUrl = '/api/openrouter'
        body.apiKey = providerKeys.openrouter || process.env.OPENROUTER_API_KEY
      } else if (model.provider === 'gemini') {
        apiUrl = '/api/gemini'
        body.apiKey = providerKeys.gemini || process.env.GEMINI_API_KEY
      } else {
        throw new Error(`Unknown provider: ${model.provider}`)
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim() || line === 'data: [DONE]') continue
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullContent += data.content
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      const assistantMessage = {
        id: `msg-${Date.now()}-${modelId}`,
        role: 'assistant' as const,
        content: fullContent || 'No response received.',
        model: modelId,
        timestamp: Date.now(),
      }

      addMessage(threadId, assistantMessage)
    } catch (error) {
      console.error(`Error getting response from ${model.label}:`, error)
      const errorMessage = {
        id: `msg-${Date.now()}-${modelId}-error`,
        role: 'assistant' as const,
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response. Please check your API keys and try again.'}`,
        model: modelId,
        timestamp: Date.now(),
      }
      addMessage(threadId, errorMessage)
    }

    setStreaming(false)
  }

  if (!model) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 pb-2 border-b">
          <h3 className="font-semibold text-sm text-muted-foreground">{model.label}</h3>
        </div>
        {!currentThread ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center max-w-md">
              <p className="text-sm">
                Select or create a thread to start chatting
              </p>
            </div>
          </div>
        ) : (
          <ChatMessages
            messages={currentThread.messages.filter(m => !m.model || m.model === modelId)}
            selectedModels={[modelId]}
          />
        )}
      </div>
      <div className="border-t p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={!threadId || isStreaming}
          placeholder={`Chat with ${model.label}...`}
        />
      </div>
    </div>
  )
}