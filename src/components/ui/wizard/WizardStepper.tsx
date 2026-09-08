import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  label: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  currentStepIndex: number
  completedSteps?: string[]
}

export function WizardStepper({ steps, currentStepIndex, completedSteps = [] }: WizardStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center w-full justify-between relative">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline/20 -z-10 -translate-y-1/2" />
        {/* Progress Track */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div key={step.id} className="flex flex-col items-center gap-sm bg-background px-xs" aria-current={isCurrent ? 'step' : undefined}>
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-title-sm border-2 transition-colors",
                  isCompleted ? "bg-primary border-primary text-on-primary" : 
                  isCurrent ? "border-primary text-primary bg-background" : 
                  "border-outline/40 text-on-surface-variant bg-surface-container"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={cn(
                "font-label-sm uppercase tracking-wider",
                isCurrent ? "text-primary font-bold" : "text-on-surface-variant"
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden flex flex-col gap-sm">
        <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
          <span>Passo {currentStepIndex + 1} de {steps.length}</span>
          <span className="font-title-sm text-primary">{steps[currentStepIndex].label}</span>
        </div>
        <div className="h-1.5 w-full bg-outline/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
