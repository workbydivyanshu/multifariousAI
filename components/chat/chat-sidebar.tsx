'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, MessageSquare, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { 
  getAllChatSessions, 
  createChatSession, 
  deleteChatSession, 
  getActiveSessionId,
  setActiveSession 
} from '@/lib/chat-sessions'
import type { ChatSession } from '@/lib/chat-sessions'

interface ChatSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeSessionId: string | null
  onSessionChange: (sessionId: string) => void
  onNewSession: (session: ChatSession) => void
}

export function ChatSidebar({
  open,
  onOpenChange,
  activeSessionId,
  onSessionChange,
  onNewSession,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [mounted, setMounted] = useState(false)

  // Load sessions only on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setSessions(getAllChatSessions())
  }, [])

  const handleNewChat = () => {
    const newSession = createChatSession()
    setSessions([...sessions, newSession])
    onNewSession(newSession)
    onSessionChange(newSession.id)
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSession(sessionId)
    onSessionChange(sessionId)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChatSession(sessionId)
    const updated = sessions.filter(s => s.id !== sessionId)
    setSessions(updated)
    
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id)
      } else {
        handleNewChat()
      }
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r bg-background transition-all duration-300',
        open ? 'w-72' : 'w-0 hidden md:w-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">Chats</h2>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="md:hidden h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b">
        <Button
          onClick={handleNewChat}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        {!mounted ? (
          <div className="p-4 text-xs text-muted-foreground text-center mt-4">
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground text-center mt-4">
            No chats yet. Start a new one!
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={cn(
                  'w-full group relative rounded-lg p-3 text-left transition-all duration-200 text-sm cursor-pointer',
                  'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  activeSessionId === session.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'border border-transparent'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className={cn(
                    'absolute right-3 top-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100',
                    'hover:bg-destructive/10 text-destructive transition-all hover:scale-110 active:scale-95'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
