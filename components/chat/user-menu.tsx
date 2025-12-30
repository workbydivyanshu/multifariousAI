'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  Download,
  Upload,
  Trash2,
  HardDrive,
  Shield,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSession, signOut } from '@/lib/auth-client'
import {
  exportChatHistory,
  clearLocalChatHistory,
  getStorageInfo
} from '@/lib/local-storage'
import { toast } from 'sonner'

export function UserMenu() {
  const router = useRouter()
  const { data: session } = useSession()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const storageInfo = getStorageInfo()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleExport = () => {
    exportChatHistory()
    toast.success('Chat history exported successfully!')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            // Validation happens in local-storage.ts
            window.location.reload()
            toast.success('Chat history imported successfully!')
          } catch {
            toast.error('Failed to import chat history')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearHistory = () => {
    clearLocalChatHistory()
    setShowClearDialog(false)
    window.location.reload()
    toast.success('Chat history cleared')
  }

  const user = session?.user
  if (!user) return null

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Privacy Section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Privacy & Data
          </DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Chat History
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import Chat History
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowClearDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Chats
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Storage Info */}
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-3 h-3" />
              <span>Local Storage: {storageInfo.percentage.toFixed(1)}% used</span>
            </div>
            <div className="text-[10px]">
              {(storageInfo.used / 1024).toFixed(1)}KB / {(storageInfo.total / 1024).toFixed(0)}KB
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your locally stored conversations. 
              This action cannot be undone. Consider exporting your chat history first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All Chats
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
