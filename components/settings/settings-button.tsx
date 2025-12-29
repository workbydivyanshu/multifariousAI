'use client'

import { useState } from 'react'
import { Settings, Plus, Trash2, Key, Download } from 'lucide-react'
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
import { useChatStore } from '@/stores/chat-store'
import { fetchOllamaModels } from '@/lib/useModels'

export function SettingsButton() {
  const [open, setOpen] = useState(false)
  const { providerKeys, setProviderKey, customModels, addCustomModel, removeCustomModel } = useChatStore()
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Keys */}
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

          {/* Ollama Models */}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
