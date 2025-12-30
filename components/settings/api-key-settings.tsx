'use client'

import { useState } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Settings2, 
  Key, 
  Check, 
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProviderConfig {
  id: string
  name: string
  keyName: string
  placeholder: string
  helpUrl: string
  description: string
  hasFreeModels: boolean
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    keyName: 'openrouter',
    placeholder: 'sk-or-v1-...',
    helpUrl: 'https://openrouter.ai/keys',
    description: '⭐ RECOMMENDED: Get FREE credits! Access 100+ models including GPT-4, Claude, DeepSeek, and more. Many models are completely free.',
    hasFreeModels: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    keyName: 'openai',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    description: 'Official OpenAI API for GPT-4, GPT-4o, and more.',
    hasFreeModels: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    keyName: 'anthropic',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Official API for Claude models - Claude 3.5 Sonnet, Opus, and more.',
    hasFreeModels: false,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    keyName: 'gemini',
    placeholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/apikey',
    description: 'Access Google\'s Gemini models with a free tier available.',
    hasFreeModels: true,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    keyName: 'mistral',
    placeholder: '...',
    helpUrl: 'https://console.mistral.ai/api-keys/',
    description: 'European AI models - Mistral Large, Medium, and more.',
    hasFreeModels: false,
  },
  {
    id: 'groq',
    name: 'Groq',
    keyName: 'groq',
    placeholder: 'gsk_...',
    helpUrl: 'https://console.groq.com/keys',
    description: 'Ultra-fast inference with LLaMA, Mixtral, and Gemma models.',
    hasFreeModels: true,
  },
  {
    id: 'together',
    name: 'Together AI',
    keyName: 'together',
    placeholder: '...',
    helpUrl: 'https://api.together.xyz/settings/api-keys',
    description: 'Access open-source models with fast inference.',
    hasFreeModels: false,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    keyName: 'ollamaUrl',
    placeholder: 'http://localhost:11434',
    helpUrl: 'https://ollama.ai',
    description: 'Run AI models locally on your own machine. 100% private and free!',
    hasFreeModels: true,
  },
]

export function ApiKeySettings() {
  const { providerKeys, setProviderKey } = useChatStore()
  const [open, setOpen] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({})
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({})

  const handleKeyChange = (provider: string, value: string) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }))
  }

  const handleSaveKey = (provider: string) => {
    const value = tempKeys[provider] || ''
    setProviderKey(provider, value)
    setTestStatus(prev => ({ ...prev, [provider]: 'idle' }))
  }

  const handleRemoveKey = (provider: string) => {
    setProviderKey(provider, '')
    setTempKeys(prev => ({ ...prev, [provider]: '' }))
    setTestStatus(prev => ({ ...prev, [provider]: 'idle' }))
  }

  const handleTestKey = async (provider: ProviderConfig) => {
    setTestStatus(prev => ({ ...prev, [provider.id]: 'testing' }))

    try {
      const key = tempKeys[provider.keyName] || (providerKeys as any)[provider.keyName] || ''
      
      if (provider.id === 'ollama') {
        // Test Ollama connection
        const url = key || 'http://localhost:11434'
        const response = await fetch(`${url}/api/tags`, { method: 'GET' })
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Connection failed')
        }
      } else if (provider.id === 'openrouter') {
        // Test OpenRouter key
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        })
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      } else if (provider.id === 'openai') {
        // Test OpenAI key
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        })
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      } else if (provider.id === 'anthropic') {
        // Test Anthropic key by checking a simple endpoint
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        })
        // 200 or 400 (bad request with valid key) means key is valid
        if (response.ok || response.status === 400) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      } else if (provider.id === 'gemini') {
        // Test Gemini key
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        )
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      } else if (provider.id === 'mistral') {
        // Test Mistral key
        const response = await fetch('https://api.mistral.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        })
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      } else if (provider.id === 'groq') {
        // Test Groq key
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        })
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      } else if (provider.id === 'together') {
        // Test Together AI key
        const response = await fetch('https://api.together.xyz/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        })
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, [provider.id]: 'success' }))
        } else {
          throw new Error('Invalid API key')
        }
      }
    } catch (error) {
      setTestStatus(prev => ({ ...prev, [provider.id]: 'error' }))
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [provider.id]: 'idle' }))
    }, 3000)
  }

  const getKeyValue = (provider: ProviderConfig) => {
    return tempKeys[provider.keyName] ?? (providerKeys as any)[provider.keyName] ?? ''
  }

  const hasKey = (provider: ProviderConfig) => {
    const value = (providerKeys as any)[provider.keyName]
    return value && value.length > 0
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          data-api-settings
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">API Keys</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Settings
          </DialogTitle>
          <DialogDescription>
            Add your API keys to access premium models, or use free models without any keys.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="openrouter" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            {PROVIDERS.map(provider => (
              <TabsTrigger 
                key={provider.id} 
                value={provider.id}
                className="relative"
              >
                {provider.name}
                {hasKey(provider) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {PROVIDERS.map(provider => (
            <TabsContent key={provider.id} value={provider.id} className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={provider.keyName}>
                    {provider.id === 'ollama' ? 'Server URL' : 'API Key'}
                  </Label>
                  {provider.hasFreeModels && (
                    <Badge variant="secondary" className="text-xs">
                      Free models available
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
                
                {/* Special prompt for OpenRouter */}
                {provider.id === 'openrouter' && !hasKey(provider) && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium mb-2">🎉 Start Free in 30 Seconds!</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      OpenRouter gives you FREE credits to try premium models like GPT-4, Claude, and DeepSeek. 
                      Plus, many models are 100% free forever.
                    </p>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => window.open(provider.helpUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Get Free OpenRouter Key
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">\n                  <div className="relative flex-1">\n                    <Input
                      id={provider.keyName}
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      placeholder={provider.placeholder}
                      value={getKeyValue(provider)}
                      onChange={(e) => handleKeyChange(provider.keyName, e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSaveKey(provider.keyName)}
                    disabled={!getKeyValue(provider)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestKey(provider)}
                    disabled={testStatus[provider.id] === 'testing'}
                  >
                    {testStatus[provider.id] === 'testing' ? 'Testing...' : 'Test'}
                  </Button>
                  {hasKey(provider) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRemoveKey(provider.keyName)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {testStatus[provider.id] === 'success' && (
                    <Badge className="bg-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  {testStatus[provider.id] === 'error' && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>

                <a
                  href={provider.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Get {provider.id === 'ollama' ? 'Ollama' : 'API key'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">💡 Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Free models work without API keys via OpenRouter</li>
            <li>• Your API keys are stored locally in your browser</li>
            <li>• Ollama lets you run AI completely offline</li>
            <li>• OpenRouter gives access to 100+ models with one key</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
