'use client'

import { useChatStore } from '@/stores/chat-store'
import { useModels } from '@/lib/useModels'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CONSTANTS } from '@/types'

// Featured free models for quick selection
const FEATURED_MODELS = [
  { id: 'llama-3.3-70b', emoji: '🦙', shortName: 'Llama 3.3' },
  { id: 'qwen-2.5-72b', emoji: '🌟', shortName: 'Qwen 2.5' },
  { id: 'gemma-3-27b', emoji: '💎', shortName: 'Gemma 3' },
]

export function QuickModelSelect() {
  const { selectedModels, toggleModel, setSelectedModels } = useChatStore()
  const { freeModels } = useModels()

  const isMaxSelected = selectedModels.length >= CONSTANTS.MAX_MODELS

  const handleSelectAll = () => {
    const featuredIds = FEATURED_MODELS.map(m => m.id)
    setSelectedModels(featuredIds.slice(0, CONSTANTS.MAX_MODELS))
  }

  const handleClearAll = () => {
    setSelectedModels([])
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Quick Select (Free Models)</span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={handleSelectAll}
              disabled={isMaxSelected && selectedModels.length === CONSTANTS.MAX_MODELS}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Select Top 5
            </Button>
            {selectedModels.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground"
                onClick={handleClearAll}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {FEATURED_MODELS.map((featured) => {
            const isSelected = selectedModels.includes(featured.id)
            const canSelect = isSelected || !isMaxSelected

            return (
              <Tooltip key={featured.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 transition-all",
                      isSelected && "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                      !canSelect && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canSelect && toggleModel(featured.id)}
                    disabled={!canSelect}
                  >
                    <span>{featured.emoji}</span>
                    <span className="hidden sm:inline">{featured.shortName}</span>
                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{featured.shortName}</p>
                  <p className="text-xs text-muted-foreground">Free • Click to {isSelected ? 'remove' : 'add'}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Additional free models indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="h-8 px-3 cursor-default">
                +{freeModels.length - FEATURED_MODELS.length} more free
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click &quot;Select Models&quot; for all options</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
