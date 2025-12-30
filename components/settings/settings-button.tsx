'use client'

import { useState } from 'react'
import { Settings, Plus, Trash2, Key, Download, Sliders, Thermometer, Hash, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useChatStore } from '@/stores/chat-store'
import { fetchOllamaModels } from '@/lib/useModels'

export function SettingsButton() {
  const [open, setOpen] = useState(false)
  const {
    providerKeys,
    setProviderKey,
    customModels,
    addCustomModel,
    removeCustomModel,
    settings,
    setSettings
  } = useChatStore()
  const [ollamaModels, setOllamaModels] = useState<string[]>([])

  const handleFetchOllama = async () => {
    const models = await fetchOllamaModels(providerKeys.ollamaUrl)
    models.forEach(m => {
      if (!customModels.find(cm => cm.id === m.id)) {
        addCustomModel(m)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="model" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="model">Model Parameters</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="models">Custom Models</TabsTrigger>
          </TabsList>

          <TabsContent value="model" className="space-y-6">
            <section>
              <h3 className="mb-4 font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Model Parameters
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature
                    </Label>
                    <span className="text-sm text-muted-foreground">{settings.temperature}</span>
                  </div>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={([value]) => setSettings({ temperature: value })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls randomness. Lower values make responses more focused and deterministic.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Max Tokens
                    </Label>
                    <span className="text-sm text-muted-foreground">{settings.maxTokens}</span>
                  </div>
                  <Slider
                    value={[settings.maxTokens]}
                    onValueChange={([value]) => setSettings({ maxTokens: value })}
                    min={100}
                    max={32000}
                    step={100}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum length of the response. Higher values allow longer responses.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Top P
                    </Label>
                    <span className="text-sm text-muted-foreground">{settings.topP}</span>
                  </div>
                  <Slider
                    value={[settings.topP]}
                    onValueChange={([value]) => setSettings({ topP: value })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls diversity. Lower values make responses more focused.
                  </p>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <section>
              <h3 className="mb-4 font-semibold flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                <Input
                  id="openrouter-key"
                  type="password"
                  placeholder="sk-or-..."
                  value={providerKeys.openrouter || ''}
                  onChange={(e) => setProviderKey('openrouter', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for Claude, GPT-4, and other paid models. Get it at{' '}
                  <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">
                    openrouter.ai
                  </a>
                </p>
              </div>

              <div>
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIza..."
                  value={providerKeys.gemini || ''}
                  onChange={(e) => setProviderKey('gemini', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for Gemini models. Get it at{' '}
                  <a href="https://makersuite.google.com" target="_blank" rel="noopener noreferrer" className="underline">
                    makersuite.google.com
                  </a>
                </p>
              </div>

              <div>
                <Label htmlFor="ollama-url">Ollama URL</Label>
                <Input
                  id="ollama-url"
                  type="text"
                  placeholder="http://localhost:11434"
                  value={providerKeys.ollamaUrl || process.env.OLLAMA_URL || ''}
                  onChange={(e) => setProviderKey('ollamaUrl', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For local AI models. Make sure Ollama is running locally.
                </p>
              </div>
            </div>
            </section>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <section>
              <h3 className="mb-4 font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Local Models (Ollama)
              </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchOllama}
              className="mb-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Import Ollama Models
            </Button>
            {customModels.filter(m => m.provider === 'ollama').length === 0 && (
              <p className="text-sm text-muted-foreground">
                No Ollama models imported yet. Make sure Ollama is running and click the button above.
              </p>
            )}
            <div className="space-y-2">
              {customModels
                .filter(m => m.provider === 'ollama')
                .map(model => (
                  <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{model.label}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </section>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
