'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useSlidesStore } from '@/stores/slides-store'

/**
 * StoreHydration component handles manual hydration of Zustand stores.
 * This is required for SSR compatibility - stores use skipHydration: true
 * to prevent hydration mismatch errors, and we manually trigger rehydration
 * on the client side after mount.
 */
export function StoreHydration() {
  useEffect(() => {
    // Rehydrate stores from localStorage after client mount
    useChatStore.persist.rehydrate()
    useSlidesStore.persist.rehydrate()
  }, [])

  return null
}
