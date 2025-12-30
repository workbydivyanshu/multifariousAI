import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, Thread, CONSTANTS, AiModel, Project } from '@/types'

// Note: Database operations are disabled for local-only mode
// All data is persisted to localStorage via zustand/persist middleware
// To enable database persistence, implement server actions separately

interface ChatState {
  threads: Thread[]
  currentThreadId: string | null
  selectedModels: string[]
  isStreaming: boolean
  webSearchEnabled: boolean
  researchEnabled: boolean
  settings: {
    temperature: number
    maxTokens: number
    topP: number
  }
  customModels: AiModel[]
  providerKeys: {
    openrouter?: string
    openai?: string
    anthropic?: string
    gemini?: string
    mistral?: string
    groq?: string
    together?: string
    perplexity?: string
    ollamaUrl?: string
  }
  projects: Project[]
  currentProjectId: string | null
  isLoading: boolean
  // Database operations (stub for local-only mode)
  loadUserData: () => Promise<void>
  saveThreadToDB: (thread: Thread) => Promise<void>
  deleteThreadFromDB: (threadId: string) => Promise<void>
  // Project operations
  createProject: (name: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (id: string | null) => void
  // Local operations
  addThread: (thread: Thread) => void
  updateThread: (id: string, updates: Partial<Thread>) => void
  deleteThread: (id: string) => void
  setCurrentThread: (id: string | null) => void
  addMessage: (threadId: string, message: Message) => void
  toggleModel: (modelId: string) => void
  setSelectedModels: (modelIds: string[]) => void
  setStreaming: (isStreaming: boolean) => void
  setWebSearchEnabled: (enabled: boolean) => void
  setResearchEnabled: (enabled: boolean) => void
  setSettings: (settings: Partial<ChatState['settings']>) => void
  addCustomModel: (model: AiModel) => void
  removeCustomModel: (modelId: string) => void
  setProviderKey: (provider: string, key: string) => void
  clearAll: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      selectedModels: [],
      isStreaming: false,
      webSearchEnabled: false,
      researchEnabled: false,
      isLoading: false,
      projects: [],
      currentProjectId: null,
      settings: {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1.0,
      },
      customModels: [],
      providerKeys: {},

      // Database operations - stubbed for local-only mode
      // All data is persisted to localStorage via zustand/persist
      loadUserData: async () => {
        // In local-only mode, data is auto-loaded from localStorage
        // No database operation needed
        set({ isLoading: false });
      },

      saveThreadToDB: async (thread) => {
        // In local-only mode, data is auto-saved to localStorage
        console.log('Thread saved locally:', thread.id);
      },

      deleteThreadFromDB: async (threadId) => {
        // In local-only mode, deletion is handled by updateThread
        console.log('Thread deleted locally:', threadId);
      },

      // Project operations
      createProject: (name: string) => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name,
          threadIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id,
        }));
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },

      setCurrentProject: (id: string | null) => {
        set({ currentProjectId: id });
      },

      // Thread operations
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
          currentThreadId: state.currentThreadId === id ? null : state.currentThreadId,
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
          const isSelected = state.selectedModels.includes(modelId);
          if (isSelected) {
            return { selectedModels: state.selectedModels.filter((id) => id !== modelId) };
          } else if (state.selectedModels.length < CONSTANTS.MAX_MODELS) {
            return { selectedModels: [...state.selectedModels, modelId] };
          }
          return state;
        }),

      setSelectedModels: (modelIds) => set({ selectedModels: modelIds.slice(0, CONSTANTS.MAX_MODELS) }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      setSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      addCustomModel: (model) =>
        set((state) => ({
          customModels: [...state.customModels, { ...model, custom: true }],
        })),

      removeCustomModel: (modelId) =>
        set((state) => ({
          customModels: state.customModels.filter((m) => m.id !== modelId),
          selectedModels: state.selectedModels.filter((id) => id !== modelId),
        })),

      setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),
      
      setResearchEnabled: (enabled) => set({ researchEnabled: enabled }),

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
          projects: [],
          currentProjectId: null,
        }),
    }),
    {
      name: 'multifarious-chat-storage',
      partialize: (state) => ({
        threads: state.threads,
        customModels: state.customModels,
        providerKeys: state.providerKeys,
        settings: state.settings,
        projects: state.projects,
        selectedModels: state.selectedModels,
      }),
    }
  )
)
