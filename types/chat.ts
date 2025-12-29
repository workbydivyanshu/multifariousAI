export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  timestamp: number
}

export interface Thread {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface ChatState {
  threads: Thread[]
  currentThreadId: string | null
  selectedModels: string[]
  isStreaming: boolean
}

export const MAX_MODELS = 5
