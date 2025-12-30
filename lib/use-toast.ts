'use client'

import { useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

class ToastManager {
  private static instance: ToastManager
  private listeners: Set<(toasts: Toast[]) => void> = new Set()
  private toasts: Toast[] = []
  private nextId = 0

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  show(message: string, type: ToastType, duration: number = 5000) {
    const id = String(this.nextId++)
    const toast: Toast = { id, message, type, duration }

    this.toasts = [...this.toasts, toast]
    this.notify()

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }

    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  getToasts(): Toast[] {
    return [...this.toasts]
  }
}

export const toastManager = ToastManager.getInstance()

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    return toastManager.show(message, type, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    toastManager.remove(id)
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    return toastManager.show(message, 'success', duration)
  }, [])

  const error = useCallback((message: string, duration?: number) => {
    return toastManager.show(message, 'error', duration ?? 7000)
  }, [])

  const warning = useCallback((message: string, duration?: number) => {
    return toastManager.show(message, 'warning', duration)
  }, [])

  const info = useCallback((message: string, duration?: number) => {
    return toastManager.show(message, 'info', duration)
  }, [])

  return {
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
