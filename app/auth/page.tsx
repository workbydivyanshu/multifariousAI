'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Github, Chrome, Shield, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSession, signInWithGithub, signInWithGoogle } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (session?.user) {
      router.push('/chat')
    }
  }, [session, router])

  const handleGithubSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGithub('/chat')
    } catch (error) {
      console.error('GitHub sign-in error:', error)
      toast.error('Authentication failed', {
        description: 'Please ensure the database is running and OAuth credentials are configured.'
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle('/chat')
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error('Authentication failed', {
        description: 'Please ensure the database is running and OAuth credentials are configured.'
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 border-2">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to access your private AI workspace
              </p>
            </div>

            {/* Social Sign In */}
            <div className="space-y-3">
              <Button
                onClick={handleGithubSignIn}
                variant="outline"
                className="w-full h-12 gap-3 text-base hover:bg-primary/5 border-2"
                size="lg"
                disabled={isSigningIn}
              >
                <Github className="w-5 h-5" />
                {isSigningIn ? 'Signing in...' : 'Continue with GitHub'}
              </Button>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-12 gap-3 text-base hover:bg-primary/5 border-2"
                size="lg"
                disabled={isSigningIn}
              >
                <Chrome className="w-5 h-5" />
                {isSigningIn ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </div>

            {/* Setup Warning */}
            <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 mb-1">Setup Required</p>
                  <p className="text-muted-foreground text-xs">
                    If sign-in fails, please check:
                    <br />• PostgreSQL database is running
                    <br />• OAuth credentials are configured (.env.local)
                    <br />• Run <code className="px-1 bg-muted rounded">npm run db:push</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">{" "}
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-600 mb-1">Privacy First</p>
                  <p className="text-muted-foreground text-xs">
                    All your conversations are stored locally in your browser. 
                    We only use your account for authentication, not for data collection.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </Card>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { label: '20+ Models', value: 'Free' },
              { label: 'Local Storage', value: '100%' },
              { label: 'No Tracking', value: 'Ever' }
            ].map((feature) => (
              <div key={feature.label} className="p-3 rounded-lg bg-card border">
                <div className="font-bold text-lg text-primary">{feature.value}</div>
                <div className="text-xs text-muted-foreground">{feature.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}