'use client'

import { useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatMain } from './chat-main'
import { ChatHeader } from './chat-header'

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <ChatHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <ChatMain />
      </div>
    </div>
  )
}
