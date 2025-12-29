import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, Thread, CONSTANTS, AiModel } from '@/types'

interface ChatState {
  threads: Thread[]
  currentThreadId: string | null
  selectedModels: string[]
  isStreaming: boolean
  settings: {
    temperature: number
    maxTokens: number
    topP: number
  }
  customModels: AiModel[]
  providerKeys: {
    openrouter?: string
    gemini?: string
    ollamaUrl?: string
  }
  addThread: (thread: Thread) => void
  updateThread: (id: string, updates: Partial<Thread>) => void
  deleteThread: (id: string) => void
  setCurrentThread: (id: string | null) => void
  addMessage: (threadId: string, message: Message) => void
  toggleModel: (modelId: string) => void
  setSelectedModels: (modelIds: string[]) => void
  setStreaming: (isStreaming: boolean) => void
  setSettings: (settings: Partial<ChatState['settings']>) => void
  addCustomModel: (model: AiModel) => void
  removeCustomModel: (modelId: string) => void
  setProviderKey: (provider: string, key: string) => void
  clearAll: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      threads: [],
      currentThreadId: null,
      selectedModels: [],
      isStreaming: false,
      settings: {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1.0,
      },
      customModels: [],
      providerKeys: {},

      addThread: (thread) =>
        set((state) => ({
          threads: [...state.threads, thread],
          currentThreadId: thread.id,
        })),

      updateThread: (id, updates) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
          ),
        })),

      deleteThread: (id) =>
        set((state) => ({
          threads: state.threads.filter((t) => t.id !== id),
          currentThreadId:
            state.currentThreadId === id ? null : state.currentThreadId,
        })),

      setCurrentThread: (id) => set({ currentThreadId: id }),

      addMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, message],
                  updatedAt: Date.now(),
                }
              : t
          ),
        })),

      toggleModel: (modelId) =>
        set((state) => {
          const isSelected = state.selectedModels.includes(modelId)
          if (isSelected) {
            return {
              selectedModels: state.selectedModels.filter((id) => id !== modelId),
            }
          } else if (state.selectedModels.length < CONSTANTS.MAX_MODELS) {
            return {
              selectedModels: [...state.selectedModels, modelId],
            }
          }
          return state
        }),

      setSelectedModels: (modelIds) =>
        set({
          selectedModels: modelIds.slice(0, CONSTANTS.MAX_MODELS),
        }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      addCustomModel: (model) =>
        set((state) => ({
          customModels: [...state.customModels, model],
        })),

      removeCustomModel: (modelId) =>
        set((state) => ({
          customModels: state.customModels.filter((m) => m.id !== modelId),
        })),

      setProviderKey: (provider, key) =>
        set((state) => ({
          providerKeys: { ...state.providerKeys, [provider]: key },
        })),

      clearAll: () =>
        set({
          threads: [],
          currentThreadId: null,
          selectedModels: [],
          isStreaming: false,
          customModels: [],
        }),
    }),
    {
      name: 'multifariousai-storage',
      partialize: (state) => ({
        threads: state.threads,
        currentThreadId: state.currentThreadId,
        selectedModels: state.selectedModels,
        settings: state.settings,
        customModels: state.customModels,
        providerKeys: state.providerKeys,
      }),
    }
  )
)
