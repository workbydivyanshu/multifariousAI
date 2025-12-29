'use client'

import { Message } from '@/types/chat'
import { getModelById } from '@/lib/models'
import { ReactMarkdown } from 'react-markdown'
import { cn } from '@/lib/utils'

interface ChatMessagesProps {
  messages: Message[]
  selectedModels: string[]
}

export function ChatMessages({ messages, selectedModels }: ChatMessagesProps) {
  const groupedMessages = messages.reduce((acc, msg) => {
    if (msg.role === 'user') {
      acc.user = msg
    } else if (msg.role === 'assistant' && msg.model) {
      if (!acc.assistants) acc.assistants = {}
      acc.assistants[msg.model] = msg
    }
    return acc
  }, {} as { user?: Message; assistants?: Record<string, Message> })

  return (
    <div className="space-y-6">
      {Object.entries(
        messages
          .filter((msg) => msg.role === 'user')
          .reduce((acc, userMsg) => {
            const timestamp = userMsg.timestamp
            const assistants = messages.filter(
              (msg) =>
                msg.role === 'assistant' &&
                msg.timestamp > timestamp &&
                msg.timestamp < (acc[timestamp]?.nextTimestamp || Infinity)
            )
            acc[timestamp] = {
              user: userMsg,
              assistants,
            }
            return acc
          }, {} as Record<number, { user: Message; assistants: Message[] }>)
      ).map(([timestamp, { user, assistants }]) => (
        <div key={timestamp} className="space-y-4">
          <div className="flex justify-end">
            <div className="max-w-2xl rounded-lg bg-primary px-4 py-2 text-primary-foreground">
              <ReactMarkdown>{user.content}</ReactMarkdown>
            </div>
          </div>
          {assistants.length > 0 && (
            <div className={cn('grid gap-4', selectedModels.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
              {assistants.map((assistant) => {
                const model = getModelById(assistant.model!)
                return (
                  <div
                    key={assistant.id}
                    className="rounded-lg border bg-muted/50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>{model?.name || assistant.model}</span>
                    </div>
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                      {assistant.content}
                    </ReactMarkdown>
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
