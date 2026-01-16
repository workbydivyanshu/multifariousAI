'use client'

import { useState, useEffect } from 'react'
import { Keyboard, Command } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ShortcutItem {
    keys: string[]
    description: string
}

const shortcuts: ShortcutItem[] = [
    { keys: ['Enter'], description: 'Send message' },
    { keys: ['Shift', 'Enter'], description: 'New line in message' },
    { keys: ['⌘/Ctrl', 'K'], description: 'Open model selector' },
    { keys: ['⌘/Ctrl', 'N'], description: 'Create new chat' },
    { keys: ['⌘/Ctrl', '/'], description: 'Open keyboard shortcuts' },
    { keys: ['Escape'], description: 'Close dialogs' },
]

function KeyIcon({ children }: { children: React.ReactNode }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium bg-muted border border-border rounded shadow-sm">
            {children}
        </kbd>
    )
}

export function KeyboardShortcutDialog() {
    const [open, setOpen] = useState(false)

    // Listen for Ctrl+/ or Cmd+/ to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault()
                setOpen(prev => !prev)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Keyboard shortcuts"
                >
                    <Keyboard className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Command className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <span className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, keyIndex) => (
                                    <KeyIcon key={keyIndex}>{key}</KeyIcon>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-xs text-muted-foreground text-center border-t pt-3">
                    Press <KeyIcon>⌘/Ctrl</KeyIcon> + <KeyIcon>/</KeyIcon> anytime to toggle this menu
                </div>
            </DialogContent>
        </Dialog>
    )
}
