'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInput } from '@/components/chat/chat-input'
import { SlideManager } from '@/components/slides/slide-manager'
import { SlidesGrid } from '@/components/slides/slides-grid'
import { useSlidesStore } from '@/stores/slides-store'
import { useChatStore } from '@/stores/chat-store'
import { parseApiError, getUserFriendlyMessage, logError } from '@/lib/error-handler'
import { Message } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Sparkles, 
  Settings2, 
  Plus,
  Award,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QueryGroup {
  id: string
  userMessage: string
  timestamp: number
}

export function SlidesMain() {
  const { 
    slides,
    isQuerying,
    setQuerying,
    addResponse,
    updateResponse,
    responses,
    getEnabledSlides,
  } = useSlidesStore()
  
  const { providerKeys, fetchedModels } = useChatStore()
  
  // Helper function to get model from fetched models
  const getModelById = (modelId: string) => {
    for (const models of Object.values(fetchedModels)) {
      const found = models.find((m: any) => m.id === modelId)
      if (found) return found
    }
    return null
  }
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const [queries, setQueries] = useState<QueryGroup[]>([])
  const [showSlideManager, setShowSlideManager] = useState(false)
  const [consensusLoading, setConsensusLoading] = useState<string | null>(null)
  const [consensusResponses, setConsensusResponses] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch - slides come from localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  const enabledSlides = getEnabledSlides()
  const apiSlides = enabledSlides.filter(s => s.type === 'api')

  // Auto-scroll to bottom on new queries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [queries.length])

  const handleSendMessage = async (content: string) => {
    if (enabledSlides.length === 0) return

    const queryId = `query-${Date.now()}`
    const newQuery: QueryGroup = {
      id: queryId,
      userMessage: content,
      timestamp: Date.now(),
    }

    setQueries(prev => [...prev, newQuery])
    setQuerying(true)

    // Query all API-based slides in parallel
    const apiPromises = apiSlides.map(async (slide) => {
      const model = getModelById(slide.modelId || '')
      if (!model) {
        addResponse(queryId, {
          slideId: slide.id,
          content: '',
          isStreaming: false,
          error: 'Model not found'
        })
        return
      }

      // Mark as streaming
      addResponse(queryId, {
        slideId: slide.id,
        content: '',
        isStreaming: true
      })

      try {
        const requestBody: any = {
          messages: [{ role: 'user', content }],
          model: model.model,
          provider: model.provider,
        }

        // Add provider-specific keys
        if (model.provider === 'ollama') {
          requestBody.baseUrl = providerKeys.ollamaUrl || 'http://localhost:11434'
        } else if (model.provider === 'openrouter') {
          requestBody.apiKey = slide.apiKey || providerKeys.openrouter
        } else if (model.provider === 'gemini') {
          requestBody.apiKey = providerKeys.gemini
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          let errorMessage = 'Failed to get response'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            // Response body might already be consumed or not JSON
            errorMessage = `Request failed with status ${response.status}`
          }
          
          // Add specific guidance for 401 errors on OpenRouter
          if (response.status === 401 && model.provider === 'openrouter') {
            errorMessage = 'OpenRouter API key required. Click the settings icon (⚙️) in the header to add your free API key from openrouter.ai'
          }
          
          throw new Error(errorMessage)
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

        updateResponse(queryId, slide.id, fullContent || 'No response received.')
      } catch (error) {
        const apiError = parseApiError(error)
        const userMessage = getUserFriendlyMessage(apiError)
        logError(`Chat error for slide ${slide.name}`, apiError)
        
        updateResponse(queryId, slide.id, '')
        // Update with error
        addResponse(queryId, {
          slideId: slide.id,
          content: '',
          isStreaming: false,
          error: userMessage
        })
      }
    })

    await Promise.all(apiPromises)
    setQuerying(false)
  }

  const handleRequestConsensus = async (queryId: string, userMessage: string) => {
    const queryResponses = responses[queryId] || []
    const validResponses = queryResponses.filter(r => r.content && !r.error)
    
    if (validResponses.length < 2) return

    setConsensusLoading(queryId)

    try {
      const response = await fetch('/api/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userMessage,
          responses: validResponses.map(r => {
            const slide = slides.find(s => s.id === r.slideId)
            return {
              model: slide?.name || 'Unknown',
              content: r.content
            }
          }),
          apiKey: providerKeys.openrouter
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get consensus')
      }

      const data = await response.json()
      setConsensusResponses(prev => ({
        ...prev,
        [queryId]: data.consensus
      }))
    } catch (error) {
      console.error('Consensus error:', error)
    } finally {
      setConsensusLoading(null)
    }
  }

  const handleCopyConsensus = async (queryId: string) => {
    const content = consensusResponses[queryId]
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopiedId(queryId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">MultifariousAI</h1>
              <p className="text-xs text-muted-foreground">
                {mounted 
                  ? `Compare ${enabledSlides.length} AI${enabledSlides.length !== 1 ? 's' : ''} side-by-side`
                  : 'Compare AIs side-by-side'
                }
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSlideManager(!showSlideManager)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Manage Slides
          </Button>
        </div>

        {/* Slide Manager Panel */}
        {showSlideManager && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <SlideManager />
          </div>
        )}
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-8 max-w-7xl mx-auto">
          {queries.length === 0 ? (
            <WelcomeScreen 
              slidesCount={mounted ? enabledSlides.length : 0}
              onAddSlide={() => setShowSlideManager(true)}
            />
          ) : (
            queries.map((query) => {
              const queryResponses = responses[query.id] || []
              const validResponses = queryResponses.filter(r => r.content && !r.error)
              const canGetConsensus = validResponses.length >= 2 && !consensusResponses[query.id]
              
              return (
                <div key={query.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl px-4 py-3">
                      <p className="whitespace-pre-wrap">{query.userMessage}</p>
                    </div>
                  </div>

                  {/* Slides Grid */}
                  <SlidesGrid
                    userMessage={query.userMessage}
                    messageId={query.id}
                  />

                  {/* Consensus Section */}
                  {(validResponses.length >= 2 || consensusResponses[query.id]) && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold">AI Consensus</span>
                          <Badge variant="outline" className="text-xs">Beta</Badge>
                        </div>
                        {canGetConsensus && (
                          <Button
                            onClick={() => handleRequestConsensus(query.id, query.userMessage)}
                            disabled={consensusLoading === query.id}
                            size="sm"
                            className="gap-2"
                          >
                            {consensusLoading === query.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Award className="w-4 h-4" />
                                Get Best Answer
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {consensusResponses[query.id] && (
                        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{consensusResponses[query.id]}</p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyConsensus(query.id)}
                            >
                              {copiedId === query.id ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}

          {isQuerying && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Getting responses from {apiSlides.length} AI(s)...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={!mounted || enabledSlides.length === 0 || isQuerying}
            placeholder={
              !mounted
                ? "Loading..."
                : enabledSlides.length === 0 
                  ? "Add AI slides first (click 'Manage Slides')..." 
                  : `Ask ${enabledSlides.length} AI${enabledSlides.length > 1 ? 's' : ''}...`
            }
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Compare responses from multiple AIs. Web slides require manual copy-paste.
          </p>
        </div>
      </div>
    </div>
  )
}

interface WelcomeScreenProps {
  slidesCount: number
  onAddSlide: () => void
}

function WelcomeScreen({ slidesCount, onAddSlide }: WelcomeScreenProps) {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground">
      <div className="text-center max-w-2xl">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-foreground">
            Welcome to MultifariousAI
          </h2>
          <p className="text-muted-foreground text-lg">
            Your free AI Fiesta alternative. Compare up to 10 AIs side-by-side!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl mb-2">🆓</div>
            <h3 className="font-semibold mb-1">Free AI Models</h3>
            <p className="text-sm text-muted-foreground">
              Use DeepSeek, Llama, Qwen & more - no API keys needed
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl mb-2">🌐</div>
            <h3 className="font-semibold mb-1">Web AI Embeds</h3>
            <p className="text-sm text-muted-foreground">
              Embed ChatGPT, Claude, Gemini directly in your workspace
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">AI Consensus</h3>
            <p className="text-sm text-muted-foreground">
              Let AI analyze all responses and pick the best answer
            </p>
          </div>
        </div>

        {slidesCount === 0 ? (
          <Button size="lg" onClick={onAddSlide} className="gap-2">
            <Plus className="w-5 h-5" />
            Add Your First AI Slide
          </Button>
        ) : (
          <p className="text-sm">
            You have {slidesCount} slide{slidesCount > 1 ? 's' : ''} ready. Start chatting below!
          </p>
        )}
      </div>
    </div>
  )
}
