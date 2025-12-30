'use client'

import { useEffect, useState } from 'react'
import { ModernChatMain } from './modern-chat-main'
import { useChatStore } from '@/stores/chat-store'

export function ChatInterface() {
  const { loadUserData } = useChatStore()

  useEffect(() => {
    // Load user data from localStorage on mount
    loadUserData()
  }, [loadUserData])

  return (
    <main className="h-screen w-full bg-background">
      <ModernChatMain />
    </main>
  )
}
