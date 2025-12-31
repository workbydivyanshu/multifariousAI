'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useSlidesStore } from '@/stores/slides-store'

// Context to track hydration state
const HydrationContext = createContext(false)

export function useHydrated() {
  return useContext(HydrationContext)
}

/**
 * StoreHydration component handles manual hydration of Zustand stores.
 * This is required for SSR compatibility - stores use skipHydration: true
 * to prevent hydration mismatch errors, and we manually trigger rehydration
 * on the client side after mount.
 */
export function StoreHydration({ children }: { children?: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Rehydrate stores from localStorage after client mount
    const rehydrate = async () => {
      await useChatStore.persist.rehydrate()
      await useSlidesStore.persist.rehydrate()
      setHydrated(true)
    }
    rehydrate()
  }, [])

  return (
    <HydrationContext.Provider value={hydrated}>
      {children}
    </HydrationContext.Provider>
  )
}
