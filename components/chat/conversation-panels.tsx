'use client'

import { Fragment, useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  Sparkles,
  AlertCircle,
  RotateCw,
  Settings2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { AISlide } from '@/types'
import { getModelById } from '@/lib/models'
import { useSlidesStore } from '@/stores/slides-store'

const SLIDES_PER_PAGE = 4

interface ConversationPanelProps {
  slides: AISlide[]
  messageId: string
  userMessage: string
  responses: Record<string, { content: string; isStreaming: boolean; error?: string }>
  onRetry?: (slideId: string) => void
}

export function ConversationPanels({
  slides,
  messageId,
  userMessage,
  responses,
  onRetry,
}: ConversationPanelProps) {
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const { reorderSlides } = useSlidesStore()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sort slides: enabled first, then disabled; within each group sort by response quality
  const sortedSlides = useMemo(() => {
    if (!mounted) return slides
    return [...slides].sort((a, b) => {
      // Disabled slides go to end
      const aDisabled = a.enabled === false ? 1 : 0
      const bDisabled = b.enabled === false ? 1 : 0
      if (aDisabled !== bDisabled) return aDisabled - bDisabled
      
      const aResponse = responses[a.id]
      const bResponse = responses[b.id]
      
      // Error responses go to end
      const aHasError = aResponse?.error ? 1 : 0
      const bHasError = bResponse?.error ? 1 : 0
      if (aHasError !== bHasError) return aHasError - bHasError
      
      // Streaming comes after completed
      const aIsStreaming = aResponse?.isStreaming ? 1 : 0
      const bIsStreaming = bResponse?.isStreaming ? 1 : 0
      if (aIsStreaming !== bIsStreaming) return aIsStreaming - bIsStreaming
      
      // Responses with content come before empty
      const aHasContent = aResponse?.content ? 0 : 1
      const bHasContent = bResponse?.content ? 0 : 1
      if (aHasContent !== bHasContent) return aHasContent - bHasContent
      
      // Keep original order
      return a.order - b.order
    })
  }, [slides, responses, mounted])

  // Pagination
  const totalPages = Math.ceil(sortedSlides.length / SLIDES_PER_PAGE)
  const startIndex = currentPage * SLIDES_PER_PAGE
  const visibleSlides = sortedSlides.slice(startIndex, startIndex + SLIDES_PER_PAGE)

  // Count errors for indicator
  const errorCount = sortedSlides.filter(s => responses[s.id]?.error).length
  const validCount = sortedSlides.length - errorCount

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Slider change handler
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0 && value < totalPages) {
      setCurrentPage(value)
    }
  }

  // Calculate slider progress safely
  const sliderProgress = totalPages > 1 ? (currentPage / Math.max(1, totalPages - 1)) * 100 : 0

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const fromGlobal = startIndex + draggedIndex
      const toGlobal = startIndex + dragOverIndex
      reorderSlides(fromGlobal, toGlobal)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Sparkles className="w-12 h-12 mb-4 opacity-50" />
        <p>No models selected. Add some models to compare responses!</p>
      </div>
    )
  }

  // Show loading skeleton during hydration
  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading responses...</span>
        </div>
      </div>
    )
  }

  // Full-screen expanded view
  if (expandedSlideId) {
    const slide = slides.find(s => s.id === expandedSlideId)
    if (!slide) return null
    const response = responses[slide.id]
    const model = getModelById(slide.modelId || '')

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <ModelAvatar provider={model?.provider || 'unknown'} />
            <div>
              <h3 className="font-semibold">{slide.name}</h3>
              <p className="text-xs text-muted-foreground">{model?.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpandedSlideId(null)}
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-6">
          <ResponseContent 
            response={response} 
            expanded 
            onRetry={() => onRetry?.(slide.id)}
          />
        </ScrollArea>
      </motion.div>
    )
  }

  // Calculate panel sizes - exactly 5 slides
  const panelCount = visibleSlides.length
  const defaultSize = 100 / panelCount
  const minSize = 15
  const maxSize = 100

  // Generate unique key based on slide IDs to force fresh render when panels change
  const panelGroupKey = visibleSlides.map(s => s.id).join('-') + `-page-${currentPage}`

  // Find best answer (longest content without errors)
  const bestSlideId = slides.reduce((best: string | null, slide) => {
    const response = responses[slide.id]
    if (!response || response.isStreaming || response.error) return best
    if (!best) return slide.id
    const bestResponse = responses[best]
    if (!bestResponse || bestResponse.isStreaming || bestResponse.error) return slide.id
    return (response.content?.length || 0) > (bestResponse.content?.length || 0) ? slide.id : best
  }, null)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden min-h-[350px]">
      {/* Status bar and slider */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-muted/30">
        {/* Status indicators */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-green-600 font-medium">✓ {validCount}</span>
          {errorCount > 0 && (
            <span className="text-destructive">✗ {errorCount}</span>
          )}
        </div>

        {/* Horizontal Slider - only show if multiple pages */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={goToPrevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <input
              type="range"
              min={0}
              max={Math.max(0, totalPages - 1)}
              value={currentPage}
              onChange={handleSliderChange}
              className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${sliderProgress}%, hsl(var(--muted)) ${sliderProgress}%, hsl(var(--muted)) 100%)`
              }}
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Page info */}
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto">
          {totalPages > 1 
            ? `${startIndex + 1}-${Math.min(startIndex + SLIDES_PER_PAGE, sortedSlides.length)} of ${sortedSlides.length}` 
            : `${sortedSlides.length} models`
          }
        </span>
      </div>

      {/* Slide Panels */}
      <ResizablePanelGroup
        key={panelGroupKey}
        direction="horizontal"
        className="flex-1 rounded-lg border bg-card/50"
      >
        {visibleSlides.map((slide, index) => {
          const response = responses[slide.id]
          const model = getModelById(slide.modelId || '')
          const isBest = slide.id === bestSlideId
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <Fragment key={slide.id}>
              <ResizablePanel
                defaultSize={defaultSize}
                minSize={minSize}
                maxSize={maxSize}
              >
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "h-full flex flex-col border-l first:border-l-0 transition-all",
                    isBest && "bg-primary/5 border-primary/30",
                    isDragging && "opacity-50 scale-95",
                    isDragOver && "border-l-2 border-l-primary bg-primary/10"
                  )}
                >
                  {/* Panel Header */}
                  <div className={cn(
                    "flex items-center justify-between p-2 border-b bg-muted/30 gap-1 cursor-grab active:cursor-grabbing",
                    isBest && "bg-primary/10 border-primary/20"
                  )}>
                    {/* Drag handle */}
                    <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />

                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <ModelAvatar provider={model?.provider || 'unknown'} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-semibold text-xs truncate">{slide.name}</h4>
                          {isBest && (
                            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[8px] px-1 py-0 whitespace-nowrap">
                              ✨ Best
                            </Badge>
                          )}
                        </div>
                        {model?.free && (
                          <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-green-500/10 text-green-600 border-green-500/20 mt-0.5">
                            Free
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedSlideId(slide.id)
                      }}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Panel Content */}
                  <ScrollArea className="flex-1">
                    <div className="p-2 h-full">
                      <ResponseContent 
                        response={response}
                        onRetry={() => onRetry?.(slide.id)}
                      />
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>

              {index < visibleSlides.length - 1 && (
                <ResizableHandle withHandle className="bg-border/50" />
              )}
            </Fragment>
          )
        })}
      </ResizablePanelGroup>
    </div>
  )
}

interface ResponseContentProps {
  response?: { content: string; isStreaming: boolean; error?: string }
  expanded?: boolean
  onRetry?: () => void
}

function ResponseContent({ response, expanded, onRetry }: ResponseContentProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (response?.content) {
      await navigator.clipboard.writeText(response.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Loading state
  if (response?.isStreaming) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Generating...</span>
        </div>
        {response.content && (
          <div className={cn(
            'prose prose-sm dark:prose-invert max-w-none',
            expanded && 'prose-lg'
          )}>
            <p className="whitespace-pre-wrap">{response.content}</p>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-2 h-5 bg-primary ml-0.5"
            />
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (response?.error) {
    const isApiKeyError = response.error.toLowerCase().includes('api key')
    
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-destructive">Error</p>
            <p className="text-sm text-muted-foreground mt-1">{response.error}</p>
            <div className="flex gap-2 mt-3">
              {isApiKeyError && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // Trigger settings dialog
                    const settingsBtn = document.querySelector('[data-api-settings]') as HTMLButtonElement
                    settingsBtn?.click()
                  }}
                  className="gap-2"
                >
                  <Settings2 className="w-3 h-3" />
                  Add API Key
                </Button>
              )}
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="gap-2"
                >
                  <RotateCw className="w-3 h-3" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Content state
  if (response?.content) {
    // Parse thinking/reasoning content if present
    // Common patterns: <think>...</think>, <thinking>...</thinking>, [thinking]...[/thinking]
    const thinkingMatch = response.content.match(/<think(?:ing)?>([\s\S]*?)<\/think(?:ing)?>/i) ||
                          response.content.match(/\[think(?:ing)?\]([\s\S]*?)\[\/think(?:ing)?\]/i)
    
    const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null
    const mainContent = thinkingMatch 
      ? response.content.replace(thinkingMatch[0], '').trim() 
      : response.content
    
    const [thinkingExpanded, setThinkingExpanded] = useState(false)

    return (
      <div className="space-y-2 flex flex-col h-full">
        {/* Thinking/Reasoning Box */}
        {thinkingContent && (
          <div className="rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
            <button
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-500/10 transition-colors rounded-t-lg"
            >
              <Brain className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Thinking Process</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {thinkingContent.length} chars
              </span>
              {thinkingExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {thinkingExpanded && (
              <div className="px-3 pb-3 border-t border-amber-500/20">
                <div className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words mt-2 max-h-48 overflow-y-auto">
                  {thinkingContent}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Main Response */}
        <div className={cn(
          'prose prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto',
          expanded && 'prose-lg'
        )}>
          <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {mainContent}
          </div>
        </div>
        <div className="flex justify-end gap-1 pt-2 border-t border-border/30 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted h-7"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Waiting state
  return (
    <div className="flex items-center justify-center h-32 text-muted-foreground">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 opacity-50" />
          </motion.div>
        </div>
        <p className="text-sm">Waiting for response...</p>
      </div>
    </div>
  )
}

interface ModelAvatarProps {
  provider: string
  size?: 'sm' | 'md'
}

function ModelAvatar({ provider, size = 'md' }: ModelAvatarProps) {
  const providerColors: Record<string, string> = {
    openrouter: 'from-purple-500 to-pink-500',
    gemini: 'from-blue-500 to-cyan-500',
    openai: 'from-green-500 to-emerald-500',
    anthropic: 'from-orange-500 to-amber-500',
    ollama: 'from-gray-500 to-slate-500',
    unknown: 'from-gray-400 to-gray-500',
  }

  const providerIcons: Record<string, string> = {
    openrouter: '🔀',
    gemini: '✨',
    openai: '🤖',
    anthropic: '🧠',
    ollama: '🦙',
    unknown: '💬',
  }

  const sizeClasses = size === 'sm' 
    ? 'w-7 h-7 text-sm' 
    : 'w-10 h-10 text-lg'

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br flex items-center justify-center shrink-0',
      providerColors[provider] || providerColors.unknown,
      sizeClasses
    )}>
      <span>{providerIcons[provider] || providerIcons.unknown}</span>
    </div>
  )
}
