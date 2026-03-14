'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const STEP_LABELS = ['Product Setup', 'Competitors', 'Run Analysis']

interface WizardStepperProps {
  currentStep: number
  totalSteps: number
}

export function WizardStepper({ currentStep, totalSteps }: WizardStepperProps) {
  return (
    <div className="flex items-center max-w-2xl mx-auto w-full">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'border-primary bg-background text-primary ring-4 ring-primary/20'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground/50',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={cn(
                  'hidden sm:block text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground/50',
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div className="relative flex-1 h-0.5 mx-2 bg-muted overflow-hidden rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
