'use client'

import { Message } from '@/types'
import { useChatStore } from '@/stores/chat-store'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface ChatMessagesProps {
  messages: Message[]
  selectedModels: string[]
}

interface MessageGroup {
  user: Message
  assistants: Message[]
}

export function ChatMessages({ messages, selectedModels }: ChatMessagesProps) {
  const { fetchedModels } = useChatStore()
  
  // Helper function to get model from fetched models
  const getModelById = (modelId: string) => {
    for (const models of Object.values(fetchedModels)) {
      const found = models.find((m: any) => m.id === modelId)
      if (found) return found
    }
    return null
  }
  
  const groupedMessages: MessageGroup[] = []

  messages.forEach((msg) => {
    if (msg.role === 'user') {
      groupedMessages.push({
        user: msg,
        assistants: [],
      })
    } else if (msg.role === 'assistant' && msg.model) {
      const lastGroup = groupedMessages[groupedMessages.length - 1]
      if (lastGroup) {
        lastGroup.assistants.push(msg)
      }
    }
  })

  return (
    <div className="space-y-6">
      {groupedMessages.map((group, index) => (
        <div key={`group-${index}`} className="space-y-4">
          <div className="flex justify-end">
            <div className="max-w-2xl rounded-lg bg-primary px-4 py-2 text-primary-foreground">
              <ReactMarkdown>{group.user.content}</ReactMarkdown>
            </div>
          </div>
          {group.assistants.length > 0 && (
            <div className={cn('grid gap-4', selectedModels.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
              {group.assistants.map((assistant) => {
                const model = getModelById(assistant.model!)
                return (
                  <div
                    key={assistant.id}
                    className="rounded-lg border bg-muted/50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>{model?.label || assistant.model}</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {assistant.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
