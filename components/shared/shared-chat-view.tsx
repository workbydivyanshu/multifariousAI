'use client'

import { ArrowLeft, Share2, User, Bot } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Message } from '@/types'
import { ChatType } from '@/db/schema'

interface SharedChatViewProps {
  chat: ChatType
  messages: Message[]
}

export function SharedChatView({ chat, messages }: SharedChatViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to MultifariousAI
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">Shared Chat</Badge>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{chat.title}</h1>
            <p className="text-muted-foreground mt-2">
              Shared on {new Date(chat.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message) => (
              <Card key={message.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {message.role === 'user' ? (
                      <>
                        <User className="h-4 w-4" />
                        You
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Assistant
                        {message.model && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {message.model}
                          </Badge>
                        )}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {message.content}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Want to create your own AI conversations?
            </p>
            <Link href="/">
              <Button>
                Try MultifariousAI
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}