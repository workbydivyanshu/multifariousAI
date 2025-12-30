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
  Zap,
  ExternalLink,
  Star
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { MODEL_CATALOG, getModelsByProvider } from '@/lib/models'
import { useSlidesStore } from '@/stores/slides-store'
import { useChatStore } from '@/stores/chat-store'
import { AiModel } from '@/types'

interface ModelSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROVIDERS = [
  { id: 'all', name: 'All Models', icon: '✨' },
  { id: 'free', name: '🎉 Free Models', icon: '🆓', highlight: true },
  { id: 'openrouter', name: 'OpenRouter', icon: '🔀', keyUrl: 'https://openrouter.ai/keys' },
  { id: 'openai', name: 'OpenAI', icon: '🤖', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', keyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'gemini', name: 'Google', icon: '💎', keyUrl: 'https://aistudio.google.com/apikey' },
  { id: 'mistral', name: 'Mistral', icon: '🌀', keyUrl: 'https://console.mistral.ai/api-keys/' },
  { id: 'groq', name: 'Groq', icon: '⚡', keyUrl: 'https://console.groq.com/keys' },
  { id: 'together', name: 'Together', icon: '🤝', keyUrl: 'https://api.together.xyz/settings/api-keys' },
  { id: 'ollama', name: 'Local', icon: '🦙', keyUrl: 'https://ollama.ai' },
]

const MAX_MODELS = 100

export function ModelSelectorDialog({ open, onOpenChange }: ModelSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeProvider, setActiveProvider] = useState('all')
  const { slides, addApiSlide, removeSlide, getEnabledSlides } = useSlidesStore()
  const { providerKeys } = useChatStore()

  const enabledSlides = getEnabledSlides().filter(s => s.type === 'api')
  const selectedModelIds = enabledSlides.map(s => s.modelId)

  const hasApiKey = (provider: string) => {
    if (provider === 'openrouter') return !!providerKeys.openrouter
    if (provider === 'openai') return !!providerKeys.openai
    if (provider === 'anthropic') return !!providerKeys.anthropic
    if (provider === 'gemini') return !!providerKeys.gemini
    if (provider === 'mistral') return !!providerKeys.mistral
    if (provider === 'groq') return !!providerKeys.groq
    if (provider === 'together') return !!providerKeys.together
    if (provider === 'ollama') return !!providerKeys.ollamaUrl
    return false
  }

  // Check if user has any API keys configured
  const hasAnyApiKey = Object.values(providerKeys).some(key => !!key)

  // Get only models that the user has API keys for
  const availableModels = useMemo(() => {
    return MODEL_CATALOG.filter(model => hasApiKey(model.provider))
  }, [providerKeys])

  // Filter models based on search and provider - only show models user has API keys for
  const filteredModels = useMemo(() => {
    let models = availableModels

    // Filter by provider
    if (activeProvider === 'free') {
      models = models.filter(m => m.free === true)
    } else if (activeProvider !== 'all') {
      models = models.filter(m => m.provider === activeProvider)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      models = models.filter(m => 
        m.label.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
      )
    }

    // Sort: free models first, then by label
    return models.sort((a, b) => {
      if (a.free && !b.free) return -1
      if (!a.free && b.free) return 1
      return a.label.localeCompare(b.label)
    })
  }, [searchQuery, activeProvider, availableModels])

  // Group models by provider
  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, AiModel[]> = {}
    filteredModels.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = []
      }
      grouped[model.provider].push(model)
    })
    return grouped
  }, [filteredModels])

  const handleSelectModel = (model: AiModel) => {
    const existingSlide = slides.find(s => s.modelId === model.id)
    
    if (existingSlide) {
      removeSlide(existingSlide.id)
    } else if (selectedModelIds.length < MAX_MODELS) {
      addApiSlide(model.id)
    }
  }

  const isModelSelected = (modelId: string) => selectedModelIds.includes(modelId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0 max-w-[95vw] rounded-lg">
        <DialogHeader className="p-3 sm:p-6 pb-3 sm:pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Choose Your AI Models
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {hasAnyApiKey 
              ? `Select up to ${MAX_MODELS} models to compare.`
              : 'Add API keys in Settings to unlock AI models.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Selected Models */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium">Selected Models</span>
            <Badge variant="outline" className={cn(
              "text-xs",
              selectedModelIds.length >= MAX_MODELS && 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            )}>
              {selectedModelIds.length}/{MAX_MODELS}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[28px] sm:min-h-[36px] max-h-[60px] sm:max-h-[80px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {enabledSlides.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs sm:text-sm text-muted-foreground"
                >
                  No models selected yet
                </motion.p>
              ) : (
                enabledSlides.map(slide => (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    <Badge 
                      variant="secondary" 
                      className="pl-1.5 sm:pl-2 pr-0.5 sm:pr-1 py-0.5 sm:py-1 gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-normal bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <span className="max-w-[80px] sm:max-w-none truncate">{slide.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 sm:h-4 sm:w-4 rounded-full hover:bg-primary/20"
                        onClick={() => removeSlide(slide.id)}
                      >
                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                      </Button>
                    </Badge>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 border-b space-y-2 sm:space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background text-sm h-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Tabs value={activeProvider} onValueChange={setActiveProvider}>
            <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0 justify-start">
              {PROVIDERS.map(provider => (
                <TabsTrigger
                  key={provider.id}
                  value={provider.id}
                  className={cn(
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-2 sm:px-4 text-[10px] sm:text-sm h-7 sm:h-9",
                    provider.id === 'free' && "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500"
                  )}
                >
                  <span className="mr-0.5 sm:mr-1.5">{provider.icon}</span>
                  <span className="hidden sm:inline">{provider.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Model List */}
        <ScrollArea className="flex-1 px-3 sm:px-6 py-3 sm:py-4">
          {!hasAnyApiKey ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-60 text-center px-4">
              <Key className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">No API Keys Configured</h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-md mb-4">
                Add your API keys in Settings to unlock AI models.
              </p>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="gap-2 text-sm">
                <Key className="w-4 h-4" />
                Add API Keys
              </Button>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-muted-foreground">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
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
            <div className="space-y-4 sm:space-y-6">
              {activeProvider === 'all' ? (
                // Show grouped by provider
                Object.entries(modelsByProvider).map(([provider, models]) => (
                  <div key={provider}>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <span className="text-base sm:text-lg">
                        {PROVIDERS.find(p => p.id === provider)?.icon || '💬'}
                      </span>
                      <h3 className="font-semibold capitalize text-sm sm:text-base">{provider}</h3>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        {models.length}
                      </Badge>
                      {!hasApiKey(provider) && provider !== 'ollama' && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                          <Key className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">API Key Required</span>
                          <span className="sm:hidden">Key Required</span>
                        </Badge>
                      )}
                    </div>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {models.map(model => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          selected={isModelSelected(model.id)}
                          disabled={!isModelSelected(model.id) && selectedModelIds.length >= MAX_MODELS}
                          hasApiKey={hasApiKey(model.provider)}
                          onSelect={() => handleSelectModel(model)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show flat list for single provider
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {filteredModels.map(model => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      selected={isModelSelected(model.id)}
                      disabled={!isModelSelected(model.id) && selectedModelIds.length >= MAX_MODELS}
                      hasApiKey={hasApiKey(model.provider)}
                      onSelect={() => handleSelectModel(model)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t bg-muted/30 flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {filteredModels.length} models
          </p>
          <Button onClick={() => onOpenChange(false)} className="gap-2 text-sm h-9">
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
  hasApiKey: boolean
  onSelect: () => void
}

function ModelCard({ model, selected, disabled, hasApiKey, onSelect }: ModelCardProps) {
  const canSelect = model.free || hasApiKey
  const isPaid = !model.free

  return (
    <motion.button
      onClick={canSelect ? onSelect : undefined}
      disabled={disabled && !selected}
      className={cn(
        'w-full text-left p-2 sm:p-3 rounded-lg border transition-all duration-200',
        'hover:shadow-md hover:border-primary/30',
        selected && 'bg-primary/5 border-primary/50 shadow-sm',
        disabled && !selected && 'opacity-50 cursor-not-allowed',
        !canSelect && 'opacity-60 cursor-not-allowed'
      )}
      whileHover={canSelect && !disabled ? { scale: 1.01 } : undefined}
      whileTap={canSelect && !disabled ? { scale: 0.99 } : undefined}
    >
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
            <span className="font-medium text-xs sm:text-sm truncate">{model.label}</span>
            {model.free ? (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 font-bold shadow-sm">
                🆓 FREE
              </Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-700 border border-amber-500/30 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 font-semibold">
                💳 PAID
              </Badge>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
            {model.description || `${model.provider} model`}
          </p>
          {model.context && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">
              {(model.context / 1000).toFixed(0)}k context
            </p>
          )}
          {isPaid && !hasApiKey && (
            <p className="text-[9px] sm:text-[10px] text-amber-600 mt-1 sm:mt-1.5 flex items-center gap-1">
              <Key className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              API key required
            </p>
          )}
        </div>
        
        <div className="shrink-0">
          {selected ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
          ) : !canSelect ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex items-center justify-center" title="API key required to use this model">
              <Key className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors">
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
