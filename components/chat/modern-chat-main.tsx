'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Settings2, 
  Zap, 
  ArrowDown,
  Plus,
  Award,
  MessageSquare,
  Loader2,
  Menu
} from 'lucide-react'
import { ModernChatInput } from '@/components/chat/modern-chat-input'
import { ConversationPanels } from '@/components/chat/conversation-panels'
import { ModelSelectorDialog } from '@/components/chat/model-selector-dialog'
import { ApiKeySettings } from '@/components/settings/api-key-settings'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { useSlidesStore } from '@/stores/slides-store'
import { useChatStore } from '@/stores/chat-store'
import { parseApiError, getUserFriendlyMessage, logError } from '@/lib/error-handler'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { 
  saveQueryToLocal, 
  updateResponseInLocal, 
  getLocalChatHistory,
  getQueriesForSession 
} from '@/lib/local-storage'
import {
  getActiveSessionId,
  getAllChatSessions,
  createChatSession,
  setActiveSession,
  addMessageToSession,
  type ChatSession
} from '@/lib/chat-sessions'

interface QueryGroup {
  id: string
  userMessage: string
  timestamp: number
}

export function ModernChatMain() {
  const { 
    slides,
    isQuerying,
    setQuerying,
    addResponse,
    updateResponse,
    responses,
    getEnabledSlides,
    addApiSlide,
    recordModelError,
    sortSlidesByErrors,
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const [queries, setQueries] = useState<QueryGroup[]>([])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [consensusLoading, setConsensusLoading] = useState<string | null>(null)
  const [consensusResponses, setConsensusResponses] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null)
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize active session on mount
  useEffect(() => {
    if (mounted) {
      const existingActive = getActiveSessionId()
      if (existingActive) {
        setActiveSessionIdState(existingActive)
      } else {
        // Create first session if none exist
        const sessions = getAllChatSessions()
        if (sessions.length === 0) {
          const newSession = createChatSession('Welcome Chat')
          setActiveSessionIdState(newSession.id)
        } else {
          setActiveSessionIdState(sessions[0].id)
        }
      }
    }
  }, [mounted])

  // Load queries from persisted responses on mount - filter by active session
  useEffect(() => {
    if (mounted && activeSessionId) {
      // Load queries for the active session
      const sessionQueries = getQueriesForSession(activeSessionId)
      const loadedQueries: QueryGroup[] = sessionQueries.map(q => ({
        id: q.id,
        userMessage: q.userMessage,
        timestamp: q.timestamp,
      })).sort((a, b) => a.timestamp - b.timestamp)
      
      setQueries(loadedQueries)
    }
  }, [mounted, activeSessionId])

  const enabledSlides = getEnabledSlides()
  const apiSlides = enabledSlides.filter(s => s.type === 'api')
  
  // Check if any API keys are configured
  const hasAnyApiKey = mounted && (
    providerKeys.openrouter ||
    providerKeys.openai ||
    providerKeys.anthropic ||
    providerKeys.gemini ||
    providerKeys.mistral ||
    providerKeys.groq ||
    providerKeys.together ||
    providerKeys.perplexity ||
    providerKeys.ollamaUrl
  )
  
  const modelCount = mounted ? apiSlides.length : 0

  // Auto-scroll and show/hide scroll button
  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current
      const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100
      if (isNearBottom) {
        element.scrollTop = element.scrollHeight
      }
    }
  }, [queries.length])

  const handleScroll = () => {
    if (scrollRef.current) {
      const element = scrollRef.current
      const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 200
      setShowScrollButton(!isNearBottom)
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleSendMessage = async (content: string) => {
    if (apiSlides.length === 0) {
      setShowModelSelector(true)
      return
    }

    // Create a new AbortController for this request batch
    abortControllerRef.current = new AbortController()

    // Auto-create a chat session if none exists
    let currentSessionId = activeSessionId
    if (!currentSessionId) {
      const newSession = createChatSession('New Chat')
      setActiveSessionIdState(newSession.id)
      setActiveSession(newSession.id)
      currentSessionId = newSession.id
      // Trigger sidebar refresh to show the new session
      setSidebarRefreshTrigger(prev => prev + 1)
    }

    const queryId = `query-${Date.now()}`
    const newQuery: QueryGroup = {
      id: queryId,
      userMessage: content,
      timestamp: Date.now(),
    }

    setQueries(prev => [...prev, newQuery])
    setQuerying(true)

    try {
      // Save to localStorage with sessionId
      try {
        saveQueryToLocal({
          id: queryId,
          userMessage: content,
          timestamp: Date.now(),
          sessionId: currentSessionId || undefined,
          responses: {}
        })
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }

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

      // Validate API key before making request
      const getProviderKey = (provider: string): string | undefined => {
        const keyMap: Record<string, string | undefined> = {
          openrouter: slide.apiKey || providerKeys.openrouter,
          openai: providerKeys.openai,
          anthropic: providerKeys.anthropic,
          gemini: providerKeys.gemini,
          mistral: providerKeys.mistral,
          groq: providerKeys.groq,
          together: providerKeys.together,
          perplexity: providerKeys.perplexity,
          ollama: providerKeys.ollamaUrl || 'http://localhost:11434'
        }
        return keyMap[provider]
      }

      const apiKey = getProviderKey(model.provider)
      
      // Check if API key is required and missing (ollama doesn't need key, just URL)
      if (model.provider !== 'ollama' && !apiKey) {
        const providerNames: Record<string, string> = {
          openrouter: 'OpenRouter',
          openai: 'OpenAI',
          anthropic: 'Anthropic',
          gemini: 'Gemini',
          mistral: 'Mistral',
          groq: 'Groq',
          together: 'Together AI',
          perplexity: 'Perplexity AI'
        }
        const providerName = providerNames[model.provider] || model.provider
        addResponse(queryId, {
          slideId: slide.id,
          content: '',
          isStreaming: false,
          error: `${providerName} API key required. Click Settings to add your key.`
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
        // Build conversation history from previous queries in this session
        // Include up to 10 previous message pairs for context (20 messages total)
        const previousQueries = activeSessionId 
          ? getQueriesForSession(activeSessionId)
            .filter(q => q.id !== queryId) // Exclude current query
            .sort((a, b) => a.timestamp - b.timestamp) // Oldest first
            .slice(-10) // Last 10 queries
          : []
        
        // Build messages array with conversation history
        const conversationMessages: { role: 'user' | 'assistant'; content: string }[] = []
        
        for (const prevQuery of previousQueries) {
          // Add user message
          conversationMessages.push({ role: 'user', content: prevQuery.userMessage })
          
          // Find the best response for this model/slide
          // Prefer the same slide, or use the first non-error response
          const slideResponse = prevQuery.responses[slide.id]
          if (slideResponse?.content && !slideResponse.error) {
            conversationMessages.push({ role: 'assistant', content: slideResponse.content })
          } else {
            // Use first successful response from any model
            const successfulResponse = Object.values(prevQuery.responses).find(
              r => r.content && !r.error && !r.isStreaming
            )
            if (successfulResponse) {
              conversationMessages.push({ role: 'assistant', content: successfulResponse.content })
            }
          }
        }
        
        // Add the current message
        conversationMessages.push({ role: 'user', content })

        const requestBody: any = {
          messages: conversationMessages,
          model: model.model,
          provider: model.provider,
        }

        // Add provider-specific keys
        if (model.provider === 'ollama') {
          requestBody.baseUrl = apiKey
        } else {
          requestBody.apiKey = apiKey
        }

        // Use shared AbortController for stop functionality (with 2 minute timeout fallback)
        if (!abortControllerRef.current) {
          abortControllerRef.current = new AbortController()
        }
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 120000)

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = 'Failed to get response'
          try {
            const errorData = await response.json()
            console.log('[Debug] Error response data:', errorData)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch (parseError) {
            console.log('[Debug] Failed to parse error response:', parseError)
            errorMessage = `Request failed with status ${response.status}`
          }
          
          if (response.status === 401) {
            const providerNames: Record<string, string> = {
              openrouter: 'OpenRouter',
              openai: 'OpenAI',
              anthropic: 'Anthropic',
              gemini: 'Gemini',
              mistral: 'Mistral',
              groq: 'Groq',
              together: 'Together AI',
              perplexity: 'Perplexity AI'
            }
            const providerName = providerNames[model.provider] || model.provider
            errorMessage = `${providerName} API key required. Add your key in settings.`
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
                  updateResponse(queryId, slide.id, fullContent)
                  
                  // Update localStorage with streaming response
                  try {
                    updateResponseInLocal(queryId, slide.id, fullContent, true)
                  } catch (error) {
                    console.error('Failed to update localStorage:', error)
                  }
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        updateResponse(queryId, slide.id, fullContent || 'No response received.')
        
        // Save final response to localStorage
        try {
          updateResponseInLocal(queryId, slide.id, fullContent || 'No response received.', false)
        } catch (error) {
          console.error('Failed to save final response to localStorage:', error)
        }
      } catch (error: any) {
        // Handle timeout/abort errors specially
        let userMessage: string
        let isDeprecationError = false
        
        if (error?.name === 'AbortError') {
          userMessage = 'Request timed out after 2 minutes. The model may be overloaded.'
        } else {
          const apiError = parseApiError(error)
          userMessage = getUserFriendlyMessage(apiError)
          const isAuthMissing = /api key required|api key missing|provide an api key/i.test(userMessage)
          if (isAuthMissing) {
            // User action issue (missing key) — warn without disabling or noisy logs
            console.warn(`[Auth] ${userMessage}`)
          } else {
            logError(`Chat error for slide ${slide.name}`, apiError)
          }
          
          // Check if this is a deprecation error - disable immediately
          const errorLower = userMessage.toLowerCase()
          isDeprecationError = errorLower.includes('deprecated') || 
                               errorLower.includes('decommission') ||
                               errorLower.includes('no longer available') ||
                               errorLower.includes('model not found') ||
                               errorLower.includes('invalid model')
          
          // If this is an auth/key error, don't auto-disable the model
          if (isAuthMissing) {
            isDeprecationError = false
          }
        }
        
        // Record the error and auto-disable the model unless it's an auth/key issue
        if (!/api key required|api key missing|provide an api key/i.test(userMessage)) {
          if (slide.modelId) {
            recordModelError(slide.modelId, userMessage)
            console.log(`[Auto-disable] Model ${slide.modelId} disabled due to error: ${userMessage}`)
          }
        }
        
        addResponse(queryId, {
          slideId: slide.id,
          content: '',
          isStreaming: false,
          error: userMessage
        })
        
        // Save error to localStorage
        try {
          updateResponseInLocal(queryId, slide.id, '', false, userMessage)
        } catch (lsError) {
          console.error('Failed to save error to localStorage:', lsError)
        }
      }
    })

    await Promise.all(apiPromises)
    
    // Sort slides so errored ones go to the end
    sortSlidesByErrors()
    } finally {
      // ALWAYS set querying to false, even if errors occurred
      setQuerying(false)
    }
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
          question: userMessage,
          responses: validResponses.map(r => ({
            model: apiSlides.find(s => s.id === r.slideId)?.name || 'Unknown',
            content: r.content
          }))
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConsensusResponses(prev => ({ ...prev, [queryId]: data.consensus }))
      }
    } catch (error) {
      console.error('Failed to get consensus:', error)
    } finally {
      setConsensusLoading(null)
    }
  }
  
  // Check if any enabled model has web search or research capabilities
  const hasWebSearchModel = apiSlides.some(slide => {
    const model = getModelById(slide.modelId || '')
    return model?.supportsWebSearch
  })
  
  const hasResearchModel = apiSlides.some(slide => {
    const model = getModelById(slide.modelId || '')
    return model?.supportsResearch
  })
  
  const hasReasoningModel = apiSlides.some(slide => {
    const model = getModelById(slide.modelId || '')
    return model?.supportsReasoning
  })

  const handleSessionChange = (sessionId: string) => {
    setActiveSessionIdState(sessionId)
    setActiveSession(sessionId)
    
    // Load queries for this session
    const sessionQueries = getQueriesForSession(sessionId)
    const loadedQueries: QueryGroup[] = sessionQueries.map(q => ({
      id: q.id,
      userMessage: q.userMessage,
      timestamp: q.timestamp,
    })).sort((a, b) => a.timestamp - b.timestamp)
    
    setQueries(loadedQueries)
    setConsensusResponses({})
  }

  const handleNewSession = (session: ChatSession) => {
    // Clear queries when creating a new session
    setQueries([])
    setConsensusResponses({})
  }

  const handleActiveSessionCleared = () => {
    // When all sessions are deleted, clear the active session state
    setActiveSessionIdState(null)
    setQueries([])
    setConsensusResponses({})
  }

  const handleStopResponse = () => {
    // Abort all pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setQuerying(false)
  }

  return (
    <div className="flex h-full bg-gradient-to-b from-background via-background to-muted/20">
      {/* Chat Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        activeSessionId={activeSessionId}
        onSessionChange={handleSessionChange}
        onNewSession={handleNewSession}
        onActiveSessionCleared={handleActiveSessionCleared}
        refreshTrigger={sidebarRefreshTrigger}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <motion.div
              className="flex items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-base sm:text-lg tracking-tight">MultifariousAI</h1>
                <p className="text-xs text-muted-foreground">
                  {mounted 
                    ? `${modelCount} model${modelCount !== 1 ? 's' : ''} active`
                    : 'Compare AI responses side-by-side'
                  }
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelSelector(true)}
              className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Models</span>
            </Button>
            <ApiKeySettings />
            <ThemeToggle />
          </div>
        </header>

        {/* Quick Setup Banner - shows when no API keys are configured */}
        {mounted && !hasAnyApiKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4\"
          >
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-primary text-sm sm:text-base\">🚀 Get Started in 30 Seconds</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add your API key to unlock 50+ AI models. OpenRouter offers free credits to get started!
              </p>
            </div>
            <Button 
              onClick={() => {
                const settingsBtn = document.querySelector('[data-api-settings]') as HTMLButtonElement
                settingsBtn?.click()
              }}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              <Settings2 className="w-4 h-4" />
              Add API Key
            </Button>
          </motion.div>
        )}

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {queries.length === 0 ? (
              <WelcomeScreen 
                modelCount={modelCount}
                onAddModels={() => setShowModelSelector(true)}
              />
            ) : (
              queries.map((query, index) => {
                const queryResponses = responses[query.id] || []
                const responseMap: Record<string, { content: string; isStreaming: boolean; error?: string }> = {}
                queryResponses.forEach(r => {
                  responseMap[r.slideId] = { content: r.content, isStreaming: r.isStreaming, error: r.error }
                })
                
                const validResponses = queryResponses.filter(r => r.content && !r.error)
                const canGetConsensus = validResponses.length >= 2 && !consensusResponses[query.id]

                return (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    {/* User Message */}
                    <div className="flex items-start gap-3 max-w-4xl">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm font-medium">{query.userMessage}</p>
                      </div>
                    </div>

                    {/* AI Responses */}
                    <div className="ml-11">
                      <ConversationPanels
                        slides={apiSlides}
                        messageId={query.id}
                        userMessage={query.userMessage}
                        responses={responseMap}
                      />
                    </div>

                    {/* Consensus Button */}
                    {canGetConsensus && (
                      <div className="ml-11 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestConsensus(query.id, query.userMessage)}
                          disabled={consensusLoading === query.id}
                          className="gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
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
                      </div>
                    )}

                    {/* Consensus Result */}
                    {consensusResponses[query.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ml-11 p-4 rounded-xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-amber-600">Best Answer</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{consensusResponses[query.id]}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={scrollToBottom}
                className="rounded-full shadow-lg gap-2"
              >
                <ArrowDown className="w-4 h-4" />
                Scroll to bottom
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t bg-background/80 backdrop-blur-sm py-2 sm:py-4 safe-area-inset-bottom\">
          <ModernChatInput
              onSend={handleSendMessage}
              onStop={handleStopResponse}
              disabled={!mounted || isQuerying}
              isLoading={isQuerying}
              modelCount={modelCount}
              placeholder={
                modelCount === 0 
                  ? "Add AI models to start comparing..."
                  : `Ask ${modelCount} AI${modelCount > 1 ? 's' : ''} anything...`
              }
              onOpenSettings={() => setShowModelSelector(true)}
              showWebSearchToggle={true}
              showResearchToggle={true}
              showReasoningToggle={true}
            />
          </div>

        {/* Model Selector Dialog */}
        <ModelSelectorDialog
          open={showModelSelector}
          onOpenChange={setShowModelSelector}
        />
      </div>
    </div>
  )
}

interface WelcomeScreenProps {
  modelCount: number
  onAddModels: () => void
}

function WelcomeScreen({ modelCount, onAddModels }: WelcomeScreenProps) {
  const features = [
    {
      icon: Sparkles,
      title: 'Add Your API Keys',
      description: 'Connect OpenRouter, OpenAI, Anthropic, Gemini, Groq, and more providers',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Compare Side-by-Side',
      description: 'Query multiple AI models simultaneously and see all responses in parallel',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Award,
      title: 'All Models Available',
      description: 'Access GPT-4, Claude, Gemini, Llama, DeepSeek, and 50+ more models',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center px-3 sm:px-4"
    >
      <motion.div
        className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-primary/25"
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
      </motion.div>

      <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">🔑 Add API Keys to Get Started</h2>
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-6 sm:mb-8">
        {modelCount === 0 
          ? 'Add your API keys to unlock AI models.' 
          : `${modelCount} model${modelCount !== 1 ? 's' : ''} ready. Add more API keys for more models.`
        }
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mb-6 sm:mb-8 w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="p-3 sm:p-4 rounded-xl border bg-card/50 text-left hover:shadow-lg transition-shadow"
          >
            <div className={cn(
              'w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2 sm:mb-3',
              feature.color
            )}>
              <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{feature.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onAddModels}
        className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        {modelCount === 0 ? 'Configure API Keys' : 'Add More Models'}
      </Button>
    </motion.div>
  )
}
