'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, MessageSquare, ChevronRight, X, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { 
  getAllChatSessions, 
  createChatSession, 
  deleteChatSession, 
  updateChatSession,
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
  onActiveSessionCleared?: () => void
  refreshTrigger?: number
}

export function ChatSidebar({
  open,
  onOpenChange,
  activeSessionId,
  onSessionChange,
  onNewSession,
  onActiveSessionCleared,
  refreshTrigger,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [mounted, setMounted] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Load sessions only on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setSessions(getAllChatSessions())
  }, [])

  // Refresh sessions when refreshTrigger changes
  useEffect(() => {
    if (mounted && refreshTrigger !== undefined) {
      setSessions(getAllChatSessions())
    }
  }, [mounted, refreshTrigger])

  // Focus the input when editing starts
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingSessionId])

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

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessionToDelete(sessionId)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return
    
    deleteChatSession(sessionToDelete)
    const updated = sessions.filter(s => s.id !== sessionToDelete)
    setSessions(updated)
    
    // If we deleted the active session, switch to another or set to null
    if (activeSessionId === sessionToDelete) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id)
      } else {
        // No sessions left - set active to null, don't auto-create
        setActiveSession(null)
        onActiveSessionCleared?.()
      }
    }
    
    setDeleteConfirmOpen(false)
    setSessionToDelete(null)
  }

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  }

  const handleSaveRename = (sessionId: string) => {
    if (editingTitle.trim()) {
      const updated = updateChatSession(sessionId, { title: editingTitle.trim() })
      if (updated) {
        setSessions(sessions.map(s => s.id === sessionId ? updated : s))
      }
    }
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const handleCancelRename = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveRename(sessionId)
    } else if (e.key === 'Escape') {
      handleCancelRename()
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
    <>
      {/* Mobile Overlay Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      <aside
        className={cn(
          'flex flex-col h-full border-r bg-background transition-all duration-300 z-50',
          // Mobile: fixed overlay drawer
          'fixed lg:relative inset-y-0 left-0',
          open ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:w-0 lg:translate-x-0 lg:hidden'
        )}
      >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3 sm:p-4">
        <h2 className="font-semibold text-sm sm:text-base">Chats</h2>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-2 sm:p-3 border-b">
        <Button
          onClick={handleNewChat}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
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
                onClick={() => {
                  handleSelectSession(session.id)
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    onOpenChange(false)
                  }
                }}
                className={cn(
                  'w-full group relative rounded-lg p-2.5 sm:p-3 text-left transition-all duration-200 text-sm cursor-pointer',
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
                    {editingSessionId === session.id ? (
                      <Input
                        ref={editInputRef}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                        onBlur={handleCancelRename}
                        className="h-6 text-sm font-medium px-1 py-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-medium truncate">
                        {session.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex gap-1">
                  {editingSessionId === session.id ? (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSaveRename(session.id)
                      }}
                      className={cn(
                        'p-1.5 rounded-md',
                        'hover:bg-primary/10 text-primary transition-all hover:scale-110 active:scale-95'
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleStartRename(session, e)}
                      className={cn(
                        'p-1.5 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100',
                        'hover:bg-primary/10 text-primary transition-all hover:scale-110 active:scale-95'
                      )}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteClick(session.id, e)}
                    className={cn(
                      'p-1.5 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100',
                      'hover:bg-destructive/10 text-destructive transition-all hover:scale-110 active:scale-95'
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
    </>
  )
}
