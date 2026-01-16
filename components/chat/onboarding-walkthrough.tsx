'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Key,
    Layers,
    MessageSquare,
    ArrowRight,
    ArrowLeft,
    Check,
    Keyboard,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingWalkthroughProps {
    onComplete: () => void
    onOpenSettings: () => void
    modelCount: number
}

interface Step {
    id: number
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
    color: string
    tips?: string[]
}

export function OnboardingWalkthrough({
    onComplete,
    onOpenSettings,
    modelCount
}: OnboardingWalkthroughProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const [isAnimating, setIsAnimating] = useState(false)

    const steps: Step[] = [
        {
            id: 0,
            icon: Sparkles,
            title: 'Welcome to MultifariousAI!',
            description: 'Compare responses from multiple AI models side-by-side. Let\'s get you set up in just a few steps.',
            color: 'from-primary via-purple-500 to-pink-500',
            tips: [
                '100+ AI models available',
                'Free and premium options',
                'Privacy-focused: data stays local'
            ]
        },
        {
            id: 1,
            icon: Key,
            title: 'Add Your API Keys',
            description: 'Connect your AI providers to unlock their models. OpenRouter is recommended - it gives you access to 100+ models with one key!',
            action: {
                label: 'Open API Settings',
                onClick: onOpenSettings
            },
            color: 'from-blue-500 to-cyan-500',
            tips: [
                'OpenRouter: 100+ models, free tier available',
                'Google Gemini: Free API access',
                'Ollama: Run models locally for free'
            ]
        },
        {
            id: 2,
            icon: Layers,
            title: 'Select AI Models',
            description: 'Choose which models to compare. Select up to 5 models to query simultaneously and see their responses side-by-side.',
            action: {
                label: 'Add Models',
                onClick: onOpenSettings
            },
            color: 'from-green-500 to-emerald-500',
            tips: [
                'GPT-4o, Claude 3.5, Gemini Pro',
                'DeepSeek, Llama 3.3, Qwen',
                'Mix free and premium models'
            ]
        },
        {
            id: 3,
            icon: Keyboard,
            title: 'Pro Tips & Shortcuts',
            description: 'Master these keyboard shortcuts to supercharge your workflow:',
            color: 'from-orange-500 to-amber-500',
            tips: [
                '⌘/Ctrl + K → Quick model selector',
                '⌘/Ctrl + N → New chat',
                '⌘/Ctrl + / → Keyboard shortcuts'
            ]
        },
        {
            id: 4,
            icon: MessageSquare,
            title: 'You\'re All Set!',
            description: 'Start chatting with multiple AI models at once. Compare their responses and find the best answers for your questions.',
            color: 'from-purple-500 to-pink-500',
            tips: [
                'Ask anything to compare responses',
                'Use "Get Best Answer" for consensus',
                'Chat history saves automatically'
            ]
        }
    ]

    const nextStep = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setCompletedSteps(prev => new Set([...prev, currentStep]))

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Mark as seen in localStorage
            localStorage.setItem('multifariousai-onboarding-complete', 'true')
            onComplete()
        }
        setTimeout(() => setIsAnimating(false), 300)
    }

    const prevStep = () => {
        if (isAnimating || currentStep === 0) return
        setIsAnimating(true)
        setCurrentStep(prev => prev - 1)
        setTimeout(() => setIsAnimating(false), 300)
    }

    const currentStepData = steps[currentStep]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 max-w-2xl mx-auto"
        >
            {/* Progress Indicators */}
            <div className="flex items-center gap-2 mb-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            index === currentStep
                                ? 'w-8 bg-primary'
                                : completedSteps.has(index)
                                    ? 'w-2 bg-primary/60'
                                    : 'w-2 bg-muted'
                        )}
                        initial={false}
                        animate={{
                            scale: index === currentStep ? 1 : 0.8
                        }}
                    />
                ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center"
                >
                    {/* Icon */}
                    <motion.div
                        className={cn(
                            'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-2xl',
                            currentStepData.color
                        )}
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <currentStepData.icon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                        {currentStepData.title}
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-6">
                        {currentStepData.description}
                    </p>

                    {/* Tips */}
                    {currentStepData.tips && (
                        <motion.div
                            className="grid gap-2 mb-6 w-full max-w-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {currentStepData.tips.map((tip, index) => (
                                <motion.div
                                    key={tip}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-2 text-left text-sm p-2 rounded-lg bg-muted/50"
                                >
                                    <div className={cn(
                                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                                        `bg-gradient-to-br ${currentStepData.color}`
                                    )}>
                                        {currentStep === 3 ? (
                                            <Zap className="w-3 h-3 text-white" />
                                        ) : (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <span className="text-muted-foreground">{tip}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Action Button (if exists) */}
                    {currentStepData.action && (
                        <Button
                            variant="outline"
                            onClick={currentStepData.action.onClick}
                            className="mb-4 gap-2"
                        >
                            <Key className="w-4 h-4" />
                            {currentStepData.action.label}
                        </Button>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-4">
                {currentStep > 0 && (
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={isAnimating}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                )}

                <Button
                    onClick={nextStep}
                    disabled={isAnimating}
                    className={cn(
                        "gap-2 min-w-[140px]",
                        currentStep === steps.length - 1
                            ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500"
                            : ""
                    )}
                >
                    {currentStep === steps.length - 1 ? (
                        <>
                            Start Chatting
                            <Sparkles className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>

            {/* Skip Link */}
            {currentStep < steps.length - 1 && (
                <button
                    onClick={() => {
                        localStorage.setItem('multifariousai-onboarding-complete', 'true')
                        onComplete()
                    }}
                    className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Skip walkthrough
                </button>
            )}
        </motion.div>
    )
}
