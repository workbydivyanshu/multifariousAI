'use client'

import { useChatStore } from '@/stores/chat-store'
import { useModels } from '@/lib/useModels'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CONSTANTS } from '@/types'

export function ModelSelector() {
  const { selectedModels, toggleModel, setSelectedModels, fetchedModels } = useChatStore()
  const { models, freeModels } = useModels()

  // Helper function to get model from fetched models
  const getModelById = (modelId: string) => {
    for (const modelList of Object.values(fetchedModels)) {
      const found = modelList.find((m: any) => m.id === modelId)
      if (found) return found
    }
    return null
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {selectedModels.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Select models to start chatting
            </span>
          ) : (
            selectedModels.map((modelId) => {
              const model = getModelById(modelId)
              return (
                <Badge
                  key={modelId}
                  variant="secondary"
                  className="cursor-pointer group"
                  onClick={() => toggleModel(modelId)}
                >
                  <span>{model?.label || modelId}</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100">×</span>
                </Badge>
              )
            })
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Select Models ({selectedModels.length}/{CONSTANTS.MAX_MODELS})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <ScrollArea className="max-h-[500px]">
              <div className="p-4 space-y-4">
                {/* Free Models Section */}
                {freeModels.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                      <span className="text-green-500">🆓</span>
                      Free Models
                    </h3>
                    <div className="space-y-2">
                      {freeModels.map((model) => (
                        <label
                          key={model.id}
                          className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-muted"
                        >
                          <Checkbox
                            checked={selectedModels.includes(model.id)}
                            onCheckedChange={() => toggleModel(model.id)}
                            disabled={
                              !selectedModels.includes(model.id) &&
                              selectedModels.length >= CONSTANTS.MAX_MODELS
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {model.label}
                              </span>
                              {model.free && (
                                <Badge variant="outline" className="text-xs">
                                  FREE
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {model.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paid Models Section */}
                {models.filter(m => !m.free).length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">
                      Paid Models (Requires API Key)
                    </h3>
                    <div className="space-y-2">
                      {models
                        .filter(m => !m.free)
                        .map((model) => (
                          <label
                            key={model.id}
                            className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-muted"
                          >
                            <Checkbox
                              checked={selectedModels.includes(model.id)}
                              onCheckedChange={() => toggleModel(model.id)}
                              disabled={
                                !selectedModels.includes(model.id) &&
                                selectedModels.length >= CONSTANTS.MAX_MODELS
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {model.label}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {model.provider}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {model.description}
                              </p>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
