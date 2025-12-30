'use client'

import { useRef, useState, useEffect } from 'react'
import { AISlide, Message } from '@/types'
import { useSlidesStore } from '@/stores/slides-store'
import { getModelById } from '@/lib/models'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  Globe,
  Key,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlidesGridProps {
  userMessage: string
  messageId: string
  onSendToSlide?: (slideId: string, message: string) => void
}

export function SlidesGrid({ userMessage, messageId, onSendToSlide }: SlidesGridProps) {
  const { slides, responses, isQuerying } = useSlidesStore()
  const enabledSlides = slides.filter(s => s.enabled)
  const messageResponses = responses[messageId] || []
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  if (enabledSlides.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No AI slides enabled. Add some slides to compare responses!</p>
      </div>
    )
  }

  // Full-screen expanded view
  if (expandedSlideId) {
    const slide = enabledSlides.find(s => s.id === expandedSlideId)
    if (!slide) return null

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">{slide.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpandedSlideId(null)}
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1">
          <SlideContent
            slide={slide}
            response={messageResponses.find(r => r.slideId === slide.id)}
            userMessage={userMessage}
            expanded
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {enabledSlides.length} AI{enabledSlides.length > 1 ? 's' : ''} responding
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={scrollLeft}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={scrollRight}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Slides Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {enabledSlides.map((slide) => {
          const response = messageResponses.find(r => r.slideId === slide.id)
          
          return (
            <div
              key={slide.id}
              className="flex-shrink-0 w-[350px] md:w-[400px] snap-center"
            >
              <div className="border rounded-lg overflow-hidden h-[500px] flex flex-col bg-card">
                {/* Slide Header */}
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {slide.name}
                    </span>
                    <Badge variant="outline" className="text-xs">API</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setExpandedSlideId(slide.id)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Slide Content */}
                <div className="flex-1 overflow-hidden">
                  <SlideContent
                    slide={slide}
                    response={response}
                    userMessage={userMessage}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SlideContentProps {
  slide: AISlide
  response?: { content: string; isStreaming: boolean; error?: string }
  userMessage: string
  expanded?: boolean
}

function SlideContent({ slide, response, userMessage, expanded }: SlideContentProps) {
  const [copied, setCopied] = useState(false)
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleCopy = async () => {
    if (response?.content) {
      await navigator.clipboard.writeText(response.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyQuestion = async () => {
    if (userMessage) {
      await navigator.clipboard.writeText(userMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const model = slide.modelId ? getModelById(slide.modelId) : null

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      <ScrollArea className="flex-1 p-4">
        {!response ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : response.error ? (
          <div className="text-sm text-destructive">{response.error}</div>
        ) : response.isStreaming ? (
          <div className="space-y-2">
            <div className="text-sm whitespace-pre-wrap">{response.content}</div>
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap">{response.content}</div>
        )}
      </ScrollArea>
      <div className="p-2 border-t flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {model?.label || slide.name}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyQuestion}
          className="gap-1.5"
        >
          {copied ? (
            <><Check className="w-3 h-3" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3" /> Copy</>
          )}
        </Button>
      </div>
    </div>
  )
}
