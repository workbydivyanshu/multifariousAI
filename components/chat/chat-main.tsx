'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInput } from './chat-input'
import { ModelSelector } from './model-selector'
import { MultiResponseView } from './multi-response-view'
import { QuickModelSelect } from './quick-model-select'
import { useChatStore } from '@/stores/chat-store'
import { parseApiError, getUserFriendlyMessage, logError } from '@/lib/error-handler'
import { Message } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Zap, Settings2 } from 'lucide-react'

interface ResponseGroup {
  userMessage: Message
  responses: Message[]
  consensusResponse?: Message | null
}

export function ChatMain() {
  const { 
    currentThreadId, 
    threads, 
    selectedModels, 
    addMessage, 
    addThread,
    setStreaming, 
    setCurrentThread,
    providerKeys, 
    isStreaming,
    fetchedModels
  } = useChatStore()
  
  // Helper function to get model from fetched models
  const getModelById = (modelId: string) => {
    for (const models of Object.values(fetchedModels)) {
      const found = models.find((m: any) => m.id === modelId)
      if (found) return found
    }
    return null
  }
  
  const currentThread = threads.find(t => t.id === currentThreadId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [consensusLoading, setConsensusLoading] = useState<string | null>(null)
  const [consensusResponses, setConsensusResponses] = useState<Record<string, Message>>({})

  // Group messages by user query
  const responseGroups: ResponseGroup[] = []
  if (currentThread) {
    let currentGroup: ResponseGroup | null = null
    
    for (const msg of currentThread.messages) {
      if (msg.role === 'user') {
        if (currentGroup) {
          responseGroups.push(currentGroup)
        }
        currentGroup = {
          userMessage: msg,
          responses: [],
          consensusResponse: consensusResponses[msg.id] || null
        }
      } else if (msg.role === 'assistant' && currentGroup) {
        currentGroup.responses.push(msg)
      }
    }
    
    if (currentGroup) {
      responseGroups.push(currentGroup)
    }
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentThread?.messages.length])

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    // Auto-create thread if none exists
    let threadId = currentThreadId
    if (!threadId) {
      const newThread = {
        id: `thread-${Date.now()}`,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      addThread(newThread)
      threadId = newThread.id
      setCurrentThread(newThread.id)
    }

    if (selectedModels.length === 0) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments,
    }

    addMessage(threadId, userMessage)
    setStreaming(true)

    const thread = threads.find(t => t.id === threadId)
    const messages = [...(thread?.messages || []), userMessage]

    // Query all selected models in parallel
    const modelPromises = selectedModels.map(async (modelId) => {
      const model = getModelById(modelId)
      if (!model) return null

      try {
        const requestBody: any = {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          model: model.model,
          provider: model.provider,
        }

        // Add provider-specific keys
        if (model.provider === 'ollama') {
          requestBody.baseUrl = providerKeys.ollamaUrl || 'http://localhost:11434'
        } else if (model.provider === 'openrouter') {
          requestBody.apiKey = providerKeys.openrouter
        } else if (model.provider === 'gemini') {
          requestBody.apiKey = providerKeys.gemini
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
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

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-${modelId}`,
          role: 'assistant',
          content: fullContent || 'No response received.',
          model: modelId,
          timestamp: Date.now(),
        }

        addMessage(threadId!, assistantMessage)
        return assistantMessage
      } catch (error) {
        const apiError = parseApiError(error)
        const userFriendlyMessage = getUserFriendlyMessage(apiError)
        logError(`Chat error for model ${model?.label || modelId}`, apiError)

        const errorMessage: Message = {
          id: `msg-${Date.now()}-${modelId}-error`,
          role: 'assistant',
          content: `⚠️ ${userFriendlyMessage}`,
          model: modelId,
          timestamp: Date.now(),
        }
        addMessage(threadId!, errorMessage)
        return errorMessage
      }
    })

    await Promise.all(modelPromises)
    setStreaming(false)
  }

  const handleRequestConsensus = async (userMessageId: string, userQuery: string, responses: Message[]) => {
    setConsensusLoading(userMessageId)

    try {
      const response = await fetch('/api/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          responses: responses.map(r => ({
            model: getModelById(r.model || '')?.label || r.model || 'Unknown',
            content: r.content
          })),
          apiKey: providerKeys.openrouter
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get consensus')
      }

      const data = await response.json()
      
      const consensusMessage: Message = {
        id: `consensus-${userMessageId}`,
        role: 'assistant',
        content: data.consensus,
        model: 'consensus',
        timestamp: Date.now(),
      }

      setConsensusResponses(prev => ({
        ...prev,
        [userMessageId]: consensusMessage
      }))
    } catch (error) {
      console.error('Consensus error:', error)
    } finally {
      setConsensusLoading(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top Bar with Quick Model Select */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">Compare AI Models</span>
            <Badge variant="outline" className="text-xs">
              {selectedModels.length} selected
            </Badge>
          </div>
          <ModelSelector />
        </div>
        <QuickModelSelect />
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-8 max-w-4xl mx-auto">
          {!currentThread || responseGroups.length === 0 ? (
            <div className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground">
              <div className="text-center max-w-lg">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to MultifariousAI</h2>
                  <p className="text-muted-foreground">
                    Compare responses from multiple AI models side-by-side.
                    Select your models above and start chatting!
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-1">🆓 Free Models</h3>
                    <p className="text-xs text-muted-foreground">
                      Use powerful AI models without any API keys
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-1">⚡ Side-by-Side</h3>
                    <p className="text-xs text-muted-foreground">
                      Compare up to 5 models at once
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-1">🏆 AI Consensus</h3>
                    <p className="text-xs text-muted-foreground">
                      Let AI pick the best answer for you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            responseGroups.map((group, idx) => (
              <MultiResponseView
                key={group.userMessage.id}
                userMessage={group.userMessage}
                responses={group.responses}
                onRequestConsensus={() => handleRequestConsensus(
                  group.userMessage.id,
                  group.userMessage.content,
                  group.responses
                )}
                consensusLoading={consensusLoading === group.userMessage.id}
                consensusResponse={group.consensusResponse}
                isStreaming={isStreaming && idx === responseGroups.length - 1}
              />
            ))
          )}

          {isStreaming && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Getting responses from {selectedModels.length} model(s)...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={selectedModels.length === 0 || isStreaming}
            placeholder={
              selectedModels.length === 0 
                ? "Select at least one model above to start..." 
                : `Ask ${selectedModels.length} AI model${selectedModels.length > 1 ? 's' : ''}...`
            }
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Responses are generated by AI and may not be accurate. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
