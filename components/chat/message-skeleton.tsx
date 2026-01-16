'use client'

import { cn } from '@/lib/utils'

interface MessageSkeletonProps {
    className?: string
    variant?: 'user' | 'assistant'
}

/**
 * MessageSkeleton - Loading skeleton for chat messages
 * Shows animated pulse effect matching message layout
 */
export function MessageSkeleton({
    className,
    variant = 'assistant'
}: MessageSkeletonProps) {
    return (
        <div className={cn('flex gap-3 animate-pulse', className)}>
            {/* Avatar skeleton */}
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-muted rounded-md w-3/4" />
                <div className="h-4 bg-muted rounded-md w-1/2" />
                {variant === 'assistant' && (
                    <>
                        <div className="h-4 bg-muted rounded-md w-5/6" />
                        <div className="h-4 bg-muted rounded-md w-2/3" />
                    </>
                )}
            </div>
        </div>
    )
}

/**
 * ResponsePanelSkeleton - Loading skeleton for response panels
 * Shows animated state during streaming
 */
export function ResponsePanelSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('p-4 rounded-xl border bg-card animate-pulse', className)}>
            {/* Header skeleton */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-muted" />
                <div className="h-4 bg-muted rounded w-24" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-2/3" />
            </div>

            {/* Streaming indicator */}
            <div className="flex items-center gap-1.5 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    )
}
