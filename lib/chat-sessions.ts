// Chat Sessions Management
// Handles creation, retrieval, and management of multiple chat sessions
// Sessions are persisted in localStorage through the chat store

import { Message, Thread } from '@/types'

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: Message[]
  selectedModels: string[]
}

const SESSIONS_KEY = 'chat_sessions'
const ACTIVE_SESSION_KEY = 'active_session_id'

/**
 * Get all saved chat sessions from localStorage
 */
export function getAllChatSessions(): ChatSession[] {
  try {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading chat sessions:', error)
    return []
  }
}

/**
 * Get a specific chat session by ID
 */
export function getChatSessionById(sessionId: string): ChatSession | null {
  const sessions = getAllChatSessions()
  return sessions.find(s => s.id === sessionId) || null
}

/**
 * Get the currently active session ID
 */
export function getActiveSessionId(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACTIVE_SESSION_KEY)
  } catch (error) {
    console.error('Error getting active session:', error)
    return null
  }
}

/**
 * Get the currently active chat session
 */
export function getActiveSession(): ChatSession | null {
  const activeId = getActiveSessionId()
  if (!activeId) return null
  return getChatSessionById(activeId)
}

/**
 * Create a new chat session
 */
export function createChatSession(title?: string): ChatSession {
  const session: ChatSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title || `Chat ${new Date().toLocaleDateString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    selectedModels: [],
  }

  const sessions = getAllChatSessions()
  sessions.push(session)
  saveChatSessions(sessions)
  setActiveSession(session.id)
  
  return session
}

/**
 * Update a chat session
 */
export function updateChatSession(
  sessionId: string,
  updates: Partial<Omit<ChatSession, 'id' | 'createdAt'>>
): ChatSession | null {
  const sessions = getAllChatSessions()
  const session = sessions.find(s => s.id === sessionId)
  
  if (!session) return null
  
  const updated = {
    ...session,
    ...updates,
    updatedAt: Date.now(),
  }
  
  const index = sessions.findIndex(s => s.id === sessionId)
  sessions[index] = updated
  saveChatSessions(sessions)
  
  return updated
}

/**
 * Delete a chat session
 */
export function deleteChatSession(sessionId: string): void {
  const sessions = getAllChatSessions()
  const filtered = sessions.filter(s => s.id !== sessionId)
  saveChatSessions(filtered)
  
  // If we deleted the active session, set active to the first remaining or null
  const activeId = getActiveSessionId()
  if (activeId === sessionId) {
    setActiveSession(filtered.length > 0 ? filtered[0].id : null)
  }
}

/**
 * Set the active chat session
 */
export function setActiveSession(sessionId: string | null): void {
  try {
    if (typeof window === 'undefined') return
    if (sessionId === null) {
      localStorage.removeItem(ACTIVE_SESSION_KEY)
    } else {
      localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
    }
  } catch (error) {
    console.error('Error setting active session:', error)
  }
}

/**
 * Add a message to a chat session
 */
export function addMessageToSession(
  sessionId: string,
  message: Message
): ChatSession | null {
  const session = getChatSessionById(sessionId)
  if (!session) return null
  
  return updateChatSession(sessionId, {
    messages: [...session.messages, message],
  })
}

/**
 * Update a specific message in a session
 */
export function updateMessageInSession(
  sessionId: string,
  messageId: string,
  updates: Partial<Message>
): ChatSession | null {
  const session = getChatSessionById(sessionId)
  if (!session) return null
  
  const updatedMessages = session.messages.map(msg => 
    msg.id === messageId ? { ...msg, ...updates } : msg
  )
  
  return updateChatSession(sessionId, {
    messages: updatedMessages,
  })
}

/**
 * Update selected models for a session
 */
export function updateSessionModels(
  sessionId: string,
  modelIds: string[]
): ChatSession | null {
  return updateChatSession(sessionId, {
    selectedModels: modelIds,
  })
}

/**
 * Save sessions to localStorage
 */
function saveChatSessions(sessions: ChatSession[]): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving chat sessions:', error)
  }
}

/**
 * Clear all chat sessions
 */
export function clearAllChatSessions(): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSIONS_KEY)
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch (error) {
    console.error('Error clearing chat sessions:', error)
  }
}

/**
 * Import sessions from thread data (for migration from old format)
 */
export function importSessionsFromThreads(threads: Thread[]): void {
  const sessions = threads.map(thread => ({
    id: thread.id,
    title: thread.title || `Chat ${new Date().toLocaleDateString()}`,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    messages: thread.messages,
    selectedModels: [],
  }))
  
  saveChatSessions(sessions)
}
