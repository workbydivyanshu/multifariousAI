'use client'

import { useState } from 'react'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ModelSelector } from './model-selector'
import { useChatStore } from '@/stores/chat-store'
import { getModelById } from '@/lib/models'
import { MAX_MODELS } from '@/types'

export function ChatMain() {
  const { currentThreadId, threads, selectedModels, addMessage, setStreaming, providerKeys, isStreaming } = useChatStore()
  const currentThread = threads.find(t => t.id === currentThreadId)

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!currentThreadId || selectedModels.length === 0) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: Date.now(),
      attachments,
    }

    addMessage(currentThreadId, userMessage)
    setStreaming(true)

    const messages = [...(currentThread?.messages || []), userMessage]

    for (const modelId of selectedModels) {
      const model = getModelById(modelId)
      if (!model) continue

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

        addMessage(currentThreadId, assistantMessage)
      } catch (error) {
        console.error(`Error getting response from ${model.label}:`, error)
        const errorMessage = {
          id: `msg-${Date.now()}-${modelId}-error`,
          role: 'assistant' as const,
          content: `Error: ${error instanceof Error ? error.message : 'Failed to get response. Please check your API keys and try again.'}`,
          model: modelId,
          timestamp: Date.now(),
        }
        addMessage(currentThreadId, errorMessage)
      }
    }

    setStreaming(false)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          {!currentThread ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold mb-2">Welcome to MultifariousAI</h2>
                <p className="text-sm">
                  Select or create a thread to start chatting with multiple AI models
                </p>
              </div>
            </div>
          ) : (
            <ChatMessages messages={currentThread.messages} selectedModels={selectedModels} />
          )}
        </div>
        <div className="border-t p-4">
          <ModelSelector />
          <ChatInput
            onSend={handleSendMessage}
            disabled={!currentThreadId || selectedModels.length === 0 || isStreaming}
          />
        </div>
      </div>
    </div>
  )
}
