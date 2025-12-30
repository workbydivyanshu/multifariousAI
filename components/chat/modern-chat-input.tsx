'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Loader2, Settings2, Sparkles, Zap, Globe, BookOpen, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/stores/chat-store'

interface ModernChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  isLoading?: boolean
  modelCount?: number
  onOpenSettings?: () => void
  showWebSearchToggle?: boolean
  showResearchToggle?: boolean
  showReasoningToggle?: boolean
}

const MIN_HEIGHT = 56
const MAX_HEIGHT = 200

export function ModernChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask anything...',
  isLoading = false,
  modelCount = 0,
  onOpenSettings,
  showWebSearchToggle = false,
  showResearchToggle = false,
  showReasoningToggle = false,
}: ModernChatInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { webSearchEnabled, researchEnabled, reasoningEnabled, setWebSearchEnabled, setResearchEnabled, setReasoningEnabled } = useChatStore()

  // Auto-resize textarea
  const adjustHeight = useCallback((reset?: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (reset) {
      textarea.style.height = `${MIN_HEIGHT}px`
      return
    }

    textarea.style.height = `${MIN_HEIGHT}px`
    const newHeight = Math.max(
      MIN_HEIGHT,
      Math.min(textarea.scrollHeight, MAX_HEIGHT)
    )
    textarea.style.height = `${newHeight}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSubmit = () => {
    if (!value.trim() || disabled || isLoading) return
    onSend(value.trim())
    setValue('')
    adjustHeight(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSubmit = value.trim() && !disabled && !isLoading

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <motion.div
        className={cn(
          'relative rounded-xl sm:rounded-2xl border-2 bg-background/80 backdrop-blur-xl shadow-lg transition-all duration-300',
          isFocused 
            ? 'border-primary/50 shadow-primary/20 shadow-xl' 
            : 'border-border/50 hover:border-border',
          disabled && 'opacity-60'
        )}
        initial={false}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Glow effect */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        <div className="p-2 sm:p-3">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'resize-none border-0 bg-transparent p-1.5 sm:p-2 text-sm sm:text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60',
              'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'
            )}
            style={{ 
              minHeight: `${MIN_HEIGHT}px`,
              maxHeight: `${MAX_HEIGHT}px`
            }}
          />

          {/* Actions bar */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-2 gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap overflow-x-auto scrollbar-hide">
              {modelCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{modelCount}</span>
                </motion.div>
              )}
              
              {/* Web Search Toggle */}
              {showWebSearchToggle && (
                <Button
                  variant={webSearchEnabled ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={cn(
                    "rounded-full h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 transition-all",
                    webSearchEnabled 
                      ? "bg-blue-500/90 hover:bg-blue-600 text-white" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Enable web search for real-time information"
                >
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs">Web</span>
                </Button>
              )}
              
              {/* Research Toggle */}
              {showResearchToggle && (
                <Button
                  variant={researchEnabled ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setResearchEnabled(!researchEnabled)}
                  className={cn(
                    "rounded-full h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 transition-all",
                    researchEnabled 
                      ? "bg-purple-500/90 hover:bg-purple-600 text-white" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Enable deep research mode for comprehensive analysis"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs">Research</span>
                </Button>
              )}
              
              {/* Reasoning Toggle */}
              {showReasoningToggle && (
                <Button
                  variant={reasoningEnabled ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setReasoningEnabled(!reasoningEnabled)}
                  className={cn(
                    "rounded-full h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 transition-all",
                    reasoningEnabled 
                      ? "bg-amber-500/90 hover:bg-amber-600 text-white" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Enable reasoning mode for step-by-step thinking"
                >
                  <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs">Think</span>
                </Button>
              )}
              
              {onOpenSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSettings}
                  className="rounded-full h-7 sm:h-8 px-2 sm:px-3 text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden md:inline ml-1.5">Settings</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Character count */}
              {value.length > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] sm:text-xs text-muted-foreground"
                >
                  {value.length}
                </motion.span>
              )}

              {/* Submit button */}
              <motion.div
                whileHover={{ scale: canSubmit ? 1.05 : 1 }}
                whileTap={{ scale: canSubmit ? 0.95 : 1 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  size="sm"
                  className={cn(
                    'rounded-full h-9 sm:h-10 px-3 sm:px-4 gap-1.5 sm:gap-2 transition-all duration-300',
                    canSubmit
                      ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white shadow-lg shadow-primary/25'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Ask AI</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Helper text - hidden on mobile */}
      <p className="hidden sm:block text-center text-xs text-muted-foreground mt-3">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
