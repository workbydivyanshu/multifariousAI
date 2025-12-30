'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Github, 
  Lock,
  Database,
  Eye,
  ArrowRight,
  Check,
  MessageSquare,
  Cpu,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">MultifariousAI</h1>
              <p className="text-[10px] text-muted-foreground">Privacy-First AI Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={handleGetStarted} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20" variant="outline">
              <Shield className="w-3 h-3 mr-1.5" />
              100% Privacy-Focused • Local Storage Only
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Compare 20+ AI Models
              <br />
              Your Data Stays Yours
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Chat with multiple AI models side-by-side. All conversations stored locally on your device. 
              Zero server storage. Zero data tracking. Complete privacy guaranteed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleGetStarted} className="gap-2 text-lg px-8 h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500">
                <Sparkles className="w-5 h-5" />
                Start Free Now
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                <Eye className="w-5 h-5" />
                See How It Works
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                20+ free models
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                100% private
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Features */}
      <section className="container mx-auto px-4 py-16" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Privacy by Design</h3>
            <p className="text-muted-foreground text-lg">Your conversations never leave your browser</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Local Storage Only',
                description: 'All chats saved in your browser. No server uploads. Complete data ownership.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Shield,
                title: 'Zero Tracking',
                description: 'No analytics. No cookies. No user profiling. Just pure AI conversation.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Database,
                title: 'Export Anytime',
                description: 'Download your entire chat history in JSON format. Move or backup freely.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all"
              >
                <div className={cn(
                  'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                  feature.color
                )}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powerful AI Comparison</h3>
            <p className="text-muted-foreground text-lg">Access the best models from multiple providers</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Sparkles,
                title: '20+ Free AI Models',
                description: 'DeepSeek R1, Llama 3.3 70B, Qwen 2.5, Gemma 3, and more. No API keys required.',
                badge: 'FREE'
              },
              {
                icon: Zap,
                title: 'Side-by-Side Comparison',
                description: 'Query up to 5 models simultaneously. See different perspectives instantly.',
                badge: 'FAST'
              },
              {
                icon: Cpu,
                title: 'Premium Model Support',
                description: 'Add your own API keys for GPT-4, Claude Opus, Gemini Pro, and more.',
                badge: 'PRO'
              },
              {
                icon: Globe,
                title: '8 AI Providers',
                description: 'OpenRouter, OpenAI, Anthropic, Google, Mistral, Groq, Together, Ollama.',
                badge: 'UNIFIED'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 rounded-xl border bg-card flex gap-4 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{feature.title}</h4>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{feature.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h3 className="text-4xl font-bold mb-4">Ready to Take Control of Your AI Conversations?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands using the only AI platform that respects your privacy
          </p>
          <Button size="lg" onClick={handleGetStarted} className="gap-2 text-lg px-10 h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500">
            <Sparkles className="w-5 h-5" />
            Start Chatting Now
          </Button>
          <p className="text-sm text-muted-foreground mt-4">Free forever • No credit card required</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Your privacy is our priority. All chats stored locally.</span>
          </div>
          <p>© {new Date().getFullYear()} MultifariousAI. Built for privacy enthusiasts.</p>
        </div>
      </footer>
    </div>
  )
}
