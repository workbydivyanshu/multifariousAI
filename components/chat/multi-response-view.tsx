'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Copy, 
  ThumbsUp,
  Sparkles,
  Loader2,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiResponseViewProps {
  userMessage: Message
  responses: Message[]
  onSelectBest?: (messageId: string) => void
  onRequestConsensus?: () => void
  consensusLoading?: boolean
  consensusResponse?: Message | null
  isStreaming?: boolean
}

export function MultiResponseView({
  userMessage,
  responses,
  onSelectBest,
  onRequestConsensus,
  consensusLoading,
  consensusResponse,
  isStreaming
}: MultiResponseViewProps) {
  const { fetchedModels } = useChatStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedBestId, setSelectedBestId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'slides' | 'grid'>('slides')

  // Helper function to get model from fetched models
  const getModelById = (modelId: string) => {
    for (const models of Object.values(fetchedModels)) {
      const found = models.find((m: any) => m.id === modelId)
      if (found) return found
    }
    return null
  }

  // Auto-scroll to show new responses
  useEffect(() => {
    if (responses.length > 0 && currentIndex === 0) {
      setCurrentIndex(0)
    }
  }, [responses.length])

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(responses.length - 1, prev + 1))
  }

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSelectBest = (id: string) => {
    setSelectedBestId(id)
    onSelectBest?.(id)
  }

  const currentResponse = responses[currentIndex]

  if (responses.length === 0 && !isStreaming) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl px-4 py-3">
          <p className="whitespace-pre-wrap">{userMessage.content}</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {responses.length} AI Response{responses.length !== 1 ? 's' : ''}
          </span>
          {isStreaming && (
            <Badge variant="secondary" className="animate-pulse">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'slides' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('slides')}
          >
            Slides
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Slides View */}
      {viewMode === 'slides' && responses.length > 0 && (
        <div className="relative">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {responses.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentIndex ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === responses.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Current Response Card */}
          {currentResponse && (
            <ResponseCard
              response={currentResponse}
              isSelected={selectedBestId === currentResponse.id}
              isCopied={copiedId === currentResponse.id}
              onCopy={() => handleCopy(currentResponse.content, currentResponse.id)}
              onSelectBest={() => handleSelectBest(currentResponse.id)}
              index={currentIndex + 1}
              total={responses.length}
              fetchedModels={fetchedModels}
            />
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && responses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses.map((response, idx) => (
            <ResponseCard
              key={response.id}
              response={response}
              isSelected={selectedBestId === response.id}
              isCopied={copiedId === response.id}
              onCopy={() => handleCopy(response.content, response.id)}
              onSelectBest={() => handleSelectBest(response.id)}
              index={idx + 1}
              total={responses.length}
              compact
              fetchedModels={fetchedModels}
            />
          ))}
        </div>
      )}

      {/* Consensus Feature */}
      {responses.length >= 2 && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">AI Consensus</span>
              <Badge variant="outline" className="text-xs">Beta</Badge>
            </div>
            {!consensusResponse && (
              <Button
                onClick={onRequestConsensus}
                disabled={consensusLoading || isStreaming}
                size="sm"
                className="gap-2"
              >
                {consensusLoading ? (
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

          {consensusResponse && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Consensus Best Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{consensusResponse.content}</p>
                  </div>
                </ScrollArea>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(consensusResponse.content, consensusResponse.id)}
                  >
                    {copiedId === consensusResponse.id ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

interface ResponseCardProps {
  response: Message
  isSelected: boolean
  isCopied: boolean
  onCopy: () => void
  onSelectBest: () => void
  index: number
  total: number
  compact?: boolean
  fetchedModels: Record<string, any[]>
}

function ResponseCard({
  response,
  isSelected,
  isCopied,
  onCopy,
  onSelectBest,
  index,
  total,
  compact,
  fetchedModels
}: ResponseCardProps) {
  // Helper function to get model from fetched models
  const getModelById = (modelId: string) => {
    for (const models of Object.values(fetchedModels)) {
      const found = models.find((m: any) => m.id === modelId)
      if (found) return found
    }
    return null
  }
  const model = getModelById(response.model || '')

  return (
    <Card className={cn(
      "transition-all",
      isSelected && "ring-2 ring-green-500 border-green-500",
      compact && "h-full"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={model?.free ? "secondary" : "default"}>
              {model?.label || response.model || 'AI'}
            </Badge>
            {model?.free && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                Free
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {index}/{total}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={compact ? "h-[200px]" : "max-h-[400px]"}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{response.content}</p>
          </div>
        </ScrollArea>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={onSelectBest}
            className={cn(isSelected && "bg-green-600 hover:bg-green-700")}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Selected Best
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 mr-1" />
                Select Best
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCopy}>
            {isCopied ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <Copy className="w-4 h-4 mr-1" />
            )}
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
