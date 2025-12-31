import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AISlide, CONSTANTS } from '@/types'
import { MODEL_CATALOG } from '@/lib/models'

interface SlideResponse {
  slideId: string
  content: string
  isStreaming: boolean
  error?: string
}

// Track models that have errored and auto-disable them
interface ModelErrorInfo {
  modelId: string
  errorCount: number
  lastError: string
  disabled: boolean
}

interface SlidesState {
  slides: AISlide[]
  responses: Record<string, SlideResponse[]> // messageId -> responses
  currentQuery: string
  isQuerying: boolean
  modelErrors: Record<string, ModelErrorInfo> // modelId -> error info
  
  // Slide management
  addSlide: (slide: Omit<AISlide, 'id' | 'order'>) => void
  removeSlide: (id: string) => void
  removeSlidesBatch: (ids: string[]) => void
  updateSlide: (id: string, updates: Partial<AISlide>) => void
  toggleSlide: (id: string) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  
  // Quick add helpers
  addApiSlide: (modelId: string, apiKey?: string, modelData?: any) => void
  addApiSlidesBatch: (models: { modelId: string; modelData?: any }[]) => void
  addAllModelsForProvider: (provider: string) => void
  
  // Error tracking
  recordModelError: (modelId: string, error: string) => void
  clearModelErrors: () => void
  resetAllSlides: () => void
  
  // Query management
  setCurrentQuery: (query: string) => void
  setQuerying: (isQuerying: boolean) => void
  addResponse: (messageId: string, response: SlideResponse) => void
  updateResponse: (messageId: string, slideId: string, content: string) => void
  clearResponses: (messageId: string) => void
  
  // Utility
  getEnabledSlides: () => AISlide[]
  getApiSlides: () => AISlide[]
  sortSlidesByErrors: () => void
}

export const useSlidesStore = create<SlidesState>()(
  persist(
    (set, get) => ({
      slides: [],
      responses: {},
      currentQuery: '',
      isQuerying: false,
      modelErrors: {},

      addSlide: (slide) => {
        const currentSlides = get().slides
        if (currentSlides.length >= CONSTANTS.MAX_SLIDES) {
          console.warn(`Maximum ${CONSTANTS.MAX_SLIDES} slides allowed`)
          return
        }
        
        // Check if this model is already added
        if (slide.modelId && currentSlides.some(s => s.modelId === slide.modelId)) {
          return // Don't add duplicate models
        }
        
        const newSlide: AISlide = {
          ...slide,
          id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order: currentSlides.length,
          enabled: true,
        }
        
        set((state) => ({
          slides: [...state.slides, newSlide]
        }))
      },

      removeSlide: (id) => {
        set((state) => ({
          slides: state.slides
            .filter((s) => s.id !== id)
            .map((s, idx) => ({ ...s, order: idx }))
        }))
      },

      removeSlidesBatch: (ids) => {
        const idsSet = new Set(ids)
        set((state) => ({
          slides: state.slides
            .filter((s) => !idsSet.has(s.id))
            .map((s, idx) => ({ ...s, order: idx }))
        }))
      },

      updateSlide: (id, updates) => {
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          )
        }))
      },

      toggleSlide: (id) => {
        set((state) => ({
          slides: state.slides.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          )
        }))
      },

      reorderSlides: (fromIndex, toIndex) => {
        set((state) => {
          const newSlides = [...state.slides]
          const [moved] = newSlides.splice(fromIndex, 1)
          newSlides.splice(toIndex, 0, moved)
          return {
            slides: newSlides.map((s, idx) => ({ ...s, order: idx }))
          }
        })
      },

      addApiSlide: (modelId, apiKey, modelData) => {
        // Use provided model data (from fetched models) or fall back to catalog
        const model = modelData || MODEL_CATALOG.find((m) => m.id === modelId)
        if (!model) return
        
        get().addSlide({
          type: 'api',
          name: model.label,
          enabled: true,
          modelId: model.id,
          provider: model.provider,
          apiKey,
        })
      },

      addApiSlidesBatch: (models) => {
        set((state) => {
          const currentSlides = state.slides
          const existingModelIds = new Set(currentSlides.map(s => s.modelId))
          const remainingSlots = CONSTANTS.MAX_SLIDES - currentSlides.length
          
          // Filter out already-added models and limit to remaining slots
          const modelsToAdd = models
            .filter(m => m.modelData && !existingModelIds.has(m.modelId))
            .slice(0, remainingSlots)
          
          // Create new slides for all models at once
          const newSlides: AISlide[] = modelsToAdd.map((m, idx) => ({
            id: `slide-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'api' as const,
            name: m.modelData.label,
            enabled: true,
            modelId: m.modelId,
            provider: m.modelData.provider,
            order: currentSlides.length + idx,
          }))
          
          return {
            slides: [...currentSlides, ...newSlides]
          }
        })
      },

      addAllModelsForProvider: (provider) => {
        // This is now less useful since models are fetched dynamically
        // Keep for backwards compatibility
        const modelsForProvider = MODEL_CATALOG.filter(m => m.provider === provider)
        const currentSlides = get().slides
        
        modelsForProvider.forEach(model => {
          // Skip if already added
          if (currentSlides.some(s => s.modelId === model.id)) return
          
          get().addApiSlide(model.id, undefined, model)
        })
      },

      recordModelError: (modelId, error) => {
        set((state) => {
          const existing = state.modelErrors[modelId] || { modelId, errorCount: 0, lastError: '', disabled: false }
          const newCount = existing.errorCount + 1
          
          // Auto-disable on first error - if a model doesn't work, disable it immediately
          const shouldDisable = true
          
          // Update slides to disable the model
          const updatedSlides = state.slides.map(s => 
            s.modelId === modelId ? { ...s, enabled: false } : s
          )
          
          return {
            slides: updatedSlides,
            modelErrors: {
              ...state.modelErrors,
              [modelId]: {
                modelId,
                errorCount: newCount,
                lastError: error,
                disabled: shouldDisable,
              }
            }
          }
        })
      },

      clearModelErrors: () => {
        set({ modelErrors: {} })
      },

      resetAllSlides: () => {
        set((state) => ({
          slides: state.slides.map(s => ({ ...s, enabled: true })),
          modelErrors: {}
        }))
      },

      sortSlidesByErrors: () => {
        set((state) => {
          const errors = state.modelErrors
          const sorted = [...state.slides].sort((a, b) => {
            // Disabled models go to end (by error count descending)
            const aModelId = a.modelId
            const bModelId = b.modelId
            const aDisabled = aModelId && errors[aModelId]?.disabled
            const bDisabled = bModelId && errors[bModelId]?.disabled
            const aErrorCount = (aModelId && errors[aModelId]?.errorCount) || 0
            const bErrorCount = (bModelId && errors[bModelId]?.errorCount) || 0
            
            // If one is disabled and other isn't, disabled goes to end
            if (aDisabled && !bDisabled) return 1
            if (!aDisabled && bDisabled) return -1
            
            // If both disabled, sort by error count (more errors = further down)
            if (aDisabled && bDisabled) {
              return bErrorCount - aErrorCount
            }
            
            // Keep original order for working models
            return a.order - b.order
          }).map((s, idx) => ({ ...s, order: idx }))
          
          return { slides: sorted }
        })
      },

      setCurrentQuery: (query) => set({ currentQuery: query }),
      
      setQuerying: (isQuerying) => set({ isQuerying }),

      addResponse: (messageId, response) => {
        set((state) => ({
          responses: {
            ...state.responses,
            [messageId]: [...(state.responses[messageId] || []), response]
          }
        }))
      },

      updateResponse: (messageId, slideId, content) => {
        set((state) => ({
          responses: {
            ...state.responses,
            [messageId]: (state.responses[messageId] || []).map((r) =>
              r.slideId === slideId ? { ...r, content, isStreaming: false } : r
            )
          }
        }))
      },

      clearResponses: (messageId) => {
        set((state) => {
          const newResponses = { ...state.responses }
          delete newResponses[messageId]
          return { responses: newResponses }
        })
      },

      getEnabledSlides: () => get().slides.filter((s) => s.enabled),
      
      getApiSlides: () => get().slides.filter((s) => s.type === 'api'),
    }),
    {
      name: 'multifarious-slides-storage',
      partialize: (state) => ({
        slides: state.slides,
        modelErrors: state.modelErrors,
        responses: state.responses, // Persist responses to survive refresh
      }),
    }
  )
)
