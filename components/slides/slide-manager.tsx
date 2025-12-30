'use client'

import { useState } from 'react'
import { AISlide, CONSTANTS } from '@/types'
import { MODEL_CATALOG, getFreeModels } from '@/lib/models'
import { useSlidesStore } from '@/stores/slides-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Globe,
  Key,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function SlideManager() {
  const { slides, addApiSlide, removeSlide, toggleSlide } = useSlidesStore()
  const [open, setOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')

  const freeModels = getFreeModels()
  const canAddMore = slides.length < CONSTANTS.MAX_SLIDES

  const handleAddApiSlide = (modelId: string) => {
    addApiSlide(modelId, selectedApiKey || undefined)
    setSelectedModelId('')
  }

  const isModelAdded = (modelId: string) => 
    slides.some(s => s.type === 'api' && s.modelId === modelId)

  return (
    <div className="space-y-4">
      {/* Current Slides */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">
            Your AI Slides ({slides.length}/{CONSTANTS.MAX_SLIDES})
          </h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!canAddMore} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Add AI Slide
                </DialogTitle>
                <DialogDescription>
                  Add an AI model via API or embed a popular AI web interface
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="free" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="free" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Free AI
                  </TabsTrigger>
                  <TabsTrigger value="api" className="gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                  </TabsTrigger>
                </TabsList>

                {/* Free Models Tab */}
                <TabsContent value="free" className="mt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    These AI models are free to use - no API key required!
                  </p>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="grid grid-cols-1 gap-2">
                      {freeModels.map((model) => {
                        const added = isModelAdded(model.id)
                        return (
                          <div
                            key={model.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              added ? "bg-green-500/10 border-green-500/30" : "hover:bg-muted/50"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">
                                  {model.label}
                                </span>
                                <Badge variant="secondary" className="text-xs text-green-600">
                                  Free
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {model.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={added ? "secondary" : "default"}
                              onClick={() => !added && handleAddApiSlide(model.id)}
                              disabled={added || !canAddMore}
                            >
                              {added ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* API Key Tab */}
                <TabsContent value="api" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>API Key (Optional)</Label>
                    <Input
                      type="password"
                      placeholder="Enter your OpenRouter API key for premium models..."
                      value={selectedApiKey}
                      onChange={(e) => setSelectedApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get a key from{' '}
                      <a 
                        href="https://openrouter.ai/keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        openrouter.ai
                      </a>
                    </p>
                  </div>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="grid grid-cols-1 gap-2">
                      {MODEL_CATALOG.filter(m => !m.free).slice(0, 20).map((model) => {
                        const added = isModelAdded(model.id)
                        return (
                          <div
                            key={model.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              added ? "bg-green-500/10 border-green-500/30" : "hover:bg-muted/50"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm truncate block">
                                {model.label}
                              </span>
                              <p className="text-xs text-muted-foreground truncate">
                                {model.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={added ? "secondary" : "outline"}
                              onClick={() => !added && handleAddApiSlide(model.id)}
                              disabled={added || !canAddMore}
                            >
                              {added ? 'Added' : 'Add'}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Slides List */}
        {slides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI slides yet</p>
            <p className="text-xs">Click &quot;Add Slide&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slides.map((slide) => (
              <SlideItem
                key={slide.id}
                slide={slide}
                onToggle={() => toggleSlide(slide.id)}
                onRemove={() => removeSlide(slide.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface SlideItemProps {
  slide: AISlide
  onToggle: () => void
  onRemove: () => void
}

function SlideItem({ slide, onToggle, onRemove }: SlideItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
      slide.enabled ? "bg-card" : "bg-muted/50 opacity-60"
    )}>
      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Key className="w-4 h-4 text-amber-500" />
        <span className="font-medium text-sm truncate">{slide.name}</span>
        <Badge variant="outline" className="text-xs">API</Badge>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
        >
          {slide.enabled ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
