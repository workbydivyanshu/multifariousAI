'use client'

import { X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/stores/chat-store'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatSidebar({ open, onOpenChange }: ChatSidebarProps) {
  const { threads, currentThreadId, setCurrentThread, deleteThread, addThread } = useChatStore()

  const handleNewChat = () => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addThread(newThread)
  }

  const handleDeleteThread = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteThread(id)
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300',
        open ? 'w-72' : 'w-0 hidden md:w-0'
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">Chats</h2>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="md:hidden">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleNewChat}
          >
            <Clock className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setCurrentThread(thread.id)}
              className={cn(
                'group relative w-full rounded-lg p-3 text-left transition-colors hover:bg-muted',
                currentThreadId === thread.id && 'bg-muted'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{thread.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteThread(e, thread.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
