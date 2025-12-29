'use client'

import { PanelLeft, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chat-store'
import { SettingsButton } from '@/components/settings/settings-button'

interface ChatHeaderProps {
  onMenuClick: () => void
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  const { currentThreadId, addThread } = useChatStore()

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

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">MultifariousAI</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleNewChat} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <SettingsButton />
      </div>
    </header>
  )
}
