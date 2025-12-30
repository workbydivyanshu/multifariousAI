'use client'

import Link from 'next/link'
import { PanelLeft, Plus, Home, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chat-store'
import { ApiKeySettings } from '@/components/settings/api-key-settings'
import { ThemeToggle } from '@/components/theme-toggle'

interface ChatHeaderProps {
  onMenuClick: () => void
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  const { addThread, setCurrentThread } = useChatStore()

  const handleNewChat = () => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addThread(newThread)
    setCurrentThread(newThread.id)
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
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold">MultifariousAI</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ApiKeySettings />
        <ThemeToggle />
        <Button onClick={handleNewChat} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </header>
  )
}
