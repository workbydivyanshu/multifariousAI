// Local storage utilities for privacy-first chat storage

export interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  modelId?: string
  slideId?: string
  timestamp: number
}

export interface LocalQuery {
  id: string
  userMessage: string
  timestamp: number
  responses: Record<string, { content: string; isStreaming: boolean; error?: string }>
}

export interface LocalChatHistory {
  queries: LocalQuery[]
  lastUpdated: number
}

const STORAGE_KEY = 'multifarious_chat_history'
const MAX_HISTORY_SIZE = 1000 // Maximum queries to store

// Get chat history from localStorage
export function getLocalChatHistory(): LocalChatHistory {
  if (typeof window === 'undefined') return { queries: [], lastUpdated: Date.now() }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { queries: [], lastUpdated: Date.now() }
    
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load chat history:', error)
    return { queries: [], lastUpdated: Date.now() }
  }
}

// Save query to localStorage
export function saveQueryToLocal(query: LocalQuery): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getLocalChatHistory()
    
    // Add new query at the beginning
    history.queries.unshift(query)
    
    // Limit history size
    if (history.queries.length > MAX_HISTORY_SIZE) {
      history.queries = history.queries.slice(0, MAX_HISTORY_SIZE)
    }
    
    history.lastUpdated = Date.now()
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save query:', error)
  }
}

// Update response in localStorage
export function updateResponseInLocal(
  queryId: string,
  slideId: string,
  content: string,
  isStreaming: boolean = false,
  error?: string
): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getLocalChatHistory()
    const query = history.queries.find(q => q.id === queryId)
    
    if (query) {
      query.responses[slideId] = { content, isStreaming, error }
      history.lastUpdated = Date.now()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }
  } catch (error) {
    console.error('Failed to update response:', error)
  }
}

// Clear all chat history
export function clearLocalChatHistory(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear chat history:', error)
  }
}

// Export chat history as JSON file
export function exportChatHistory(): void {
  const history = getLocalChatHistory()
  const dataStr = JSON.stringify(history, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `multifarious-chat-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import chat history from JSON file
export function importChatHistory(file: File, callback: (success: boolean) => void): void {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const imported = JSON.parse(content) as LocalChatHistory
      
      // Validate structure
      if (!imported.queries || !Array.isArray(imported.queries)) {
        throw new Error('Invalid chat history format')
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported))
      callback(true)
    } catch (error) {
      console.error('Failed to import chat history:', error)
      callback(false)
    }
  }
  
  reader.onerror = () => {
    console.error('Failed to read file')
    callback(false)
  }
  
  reader.readAsText(file)
}

// Get storage usage info
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  if (typeof window === 'undefined') return { used: 0, total: 0, percentage: 0 }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || ''
    const used = new Blob([stored]).size
    const total = 5 * 1024 * 1024 // 5MB typical localStorage limit
    const percentage = (used / total) * 100
    
    return { used, total, percentage }
  } catch {
    return { used: 0, total: 0, percentage: 0 }
  }
}
