'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Check, 
  Plus, 
  Key, 
  Sparkles,
  PlusCircle,
  Trash2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSlidesStore } from '@/stores/slides-store'
import { useChatStore } from '@/stores/chat-store'
import { AiModel } from '@/types'

interface ModelSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_MODELS = 1000

export function ModelSelectorDialog({ open, onOpenChange }: ModelSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { slides, addApiSlide, addApiSlidesBatch, removeSlide, removeSlidesBatch, getEnabledSlides } = useSlidesStore()
  const { providerKeys, fetchedModels } = useChatStore()

  const enabledSlides = getEnabledSlides().filter(s => s.type === 'api')
  const selectedModelIds = enabledSlides.map(s => s.modelId)

  // Check if user has any API keys configured
  const hasAnyApiKey = Object.values(providerKeys).some(key => !!key)

  // Get all fetched models from all providers
  const availableModels = useMemo(() => {
    return Object.values(fetchedModels).flat() as AiModel[]
  }, [fetchedModels])

  // Filter models based on search
  const filteredModels = useMemo(() => {
    let models = availableModels

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      models = models.filter(m => 
        m.label.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
      )
    }

    // Sort by label alphabetically
    return models.sort((a, b) => a.label.localeCompare(b.label))
  }, [searchQuery, availableModels])

  const handleSelectModel = (model: AiModel) => {
    const existingSlide = slides.find(s => s.modelId === model.id)
    
    if (existingSlide) {
      removeSlide(existingSlide.id)
    } else if (selectedModelIds.length < MAX_MODELS) {
      // Pass the full model object for fetched models
      addApiSlide(model.id, undefined, model)
    }
  }

  const isModelSelected = (modelId: string) => selectedModelIds.includes(modelId)

  const handleAddAll = () => {
    // Get models that aren't already selected
    const modelsToAdd = availableModels
      .filter(model => !isModelSelected(model.id))
      .map(model => ({ modelId: model.id, modelData: model }))
    
    // Use batch add for atomic operation
    addApiSlidesBatch(modelsToAdd)
  }

  const handleRemoveAll = () => {
    // Remove all selected slides in batch
    const slideIds = enabledSlides.map(slide => slide.id)
    removeSlidesBatch(slideIds)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col p-0 gap-0 max-w-[95vw] rounded-lg">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Select AI Models
          </DialogTitle>
          <DialogDescription className="text-sm">
            {hasAnyApiKey 
              ? `${availableModels.length} models available • ${selectedModelIds.length} selected`
              : 'Add API keys in Settings to unlock AI models.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Selected Models Pills */}
        {enabledSlides.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-b bg-muted/30">
            <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {enabledSlides.map(slide => (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    <Badge 
                      variant="secondary" 
                      className="pl-2 pr-1 py-1 gap-1 text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <span className="max-w-[120px] truncate">{slide.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-primary/20"
                        onClick={() => removeSlide(slide.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-4 sm:px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background h-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Model List */}
        <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
          {!hasAnyApiKey ? (
            <div className="flex flex-col items-center justify-center h-60 text-center px-4">
              <Key className="w-12 h-12 mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No API Keys Configured</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-4">
                Add your API keys in Settings to unlock AI models.
              </p>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="gap-2">
                <Key className="w-4 h-4" />
                Go to Settings
              </Button>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No models found</p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  className="text-sm"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {filteredModels.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  selected={isModelSelected(model.id)}
                  disabled={!isModelSelected(model.id) && selectedModelIds.length >= MAX_MODELS}
                  onSelect={() => handleSelectModel(model)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddAll}
              disabled={!hasAnyApiKey || availableModels.length === 0 || selectedModelIds.length >= availableModels.length}
              className="gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRemoveAll}
              disabled={selectedModelIds.length === 0}
              className="gap-1.5 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove All
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)} className="gap-2">
            <Check className="w-4 h-4" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ModelCardProps {
  model: AiModel
  selected: boolean
  disabled: boolean
  onSelect: () => void
}

function ModelCard({ model, selected, disabled, onSelect }: ModelCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled && !selected}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all duration-200',
        'hover:shadow-md hover:border-primary/30',
        selected && 'bg-primary/5 border-primary/50 shadow-sm',
        disabled && !selected && 'opacity-50 cursor-not-allowed'
      )}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{model.label}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {model.description || `${model.provider} model`}
          </p>
          {model.context && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {(model.context / 1000).toFixed(0)}k context
            </p>
          )}
        </div>
        
        <div className="shrink-0">
          {selected ? (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors">
              <Plus className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
