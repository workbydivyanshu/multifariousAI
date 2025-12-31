export interface AiModel {
  id: string
  label: string
  provider: string
  model: string
  free?: boolean
  category?: 'text' | 'coding' | 'image' | 'audio'
  description?: string
  context?: number
  custom?: boolean
  supportsWebSearch?: boolean
  supportsResearch?: boolean
  supportsReasoning?: boolean
}

export interface Provider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  supportsFree: boolean
  supportsStreaming: boolean
  requiresAuth: boolean
}

// Slide Types - for the multi-AI comparison interface
export type SlideType = 'api'

export interface AISlide {
  id: string
  type: SlideType
  name: string
  enabled: boolean
  // For API-based slides
  modelId?: string
  provider?: string
  apiKey?: string
  // UI state
  collapsed?: boolean
  order: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  slideId?: string
  timestamp: number
  attachments?: Attachment[]
}

export interface Attachment {
  type: 'image' | 'pdf' | 'docx' | 'text'
  url?: string
  base64?: string
  filename?: string
}

export interface Thread {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  description?: string
  threadIds: string[]
  createdAt: number
  updatedAt: number
}

export interface ChatSettings {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export const CONSTANTS = {
  MAX_MODELS: 1000,
  MAX_SLIDES: 1000,
  FREE_MESSAGE_LIMIT: 50,
  RESET_TIME: 24 * 60 * 60 * 1000, //1 day
  MAX_OUTPUT_TOKENS: 10000,
}

export const MAX_MODELS = 1000
export const MAX_SLIDES = 1000
