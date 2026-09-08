import React from 'react'
import { WizardStepper, type WizardStep } from './WizardStepper'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface WizardShellProps {
  title: string
  subtitle?: string
  steps: WizardStep[]
  currentStepIndex: number
  completedSteps?: string[]
  children: React.ReactNode
  
  // State
  isSaving?: boolean
  lastSavedAt?: string | null
  canGoBack?: boolean
  canGoForward?: boolean
  isLastStep?: boolean
  
  // Actions
  onBack?: () => void
  onNext?: () => void
  onSaveDraft?: () => void
}

export function WizardShell({
  title,
  subtitle,
  steps,
  currentStepIndex,
  completedSteps,
  children,
  isSaving,
  lastSavedAt,
  canGoBack = true,
  canGoForward = true,
  isLastStep = false,
  onBack,
  onNext,
  onSaveDraft
}: WizardShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center py-lg px-md">
      <div className="w-full max-w-5xl flex flex-col gap-xl">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h1 className="font-display-sm text-on-surface">{title}</h1>
            {subtitle && (
              <p className="text-on-surface-variant mt-xs max-w-2xl">{subtitle}</p>
            )}
          </div>
          
          <div className="text-label-sm text-on-surface-variant flex items-center gap-xs">
            {isSaving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> A guardar...</>
            ) : lastSavedAt ? (
              <><Save className="w-3 h-3" /> Último rascunho: {lastSavedAt}</>
            ) : null}
          </div>
        </header>

        {/* Stepper */}
        <WizardStepper 
          steps={steps} 
          currentStepIndex={currentStepIndex} 
          completedSteps={completedSteps} 
        />

        {/* Main Content Area */}
        <Card className="p-md md:p-xl rounded-2xl bg-surface-container-lowest shadow-sm border-outline/10">
          {children}
        </Card>

        {/* Action Footer */}
        <footer className="flex flex-col-reverse md:flex-row justify-between items-center gap-md">
          {onBack ? (
            <Button variant="outline" onClick={onBack} disabled={!canGoBack} className="w-full md:w-auto gap-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          ) : <div />}
          
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-sm md:gap-md">
            {onSaveDraft && (
              <Button variant="ghost" onClick={onSaveDraft} disabled={isSaving} className="w-full md:w-auto">
                Guardar Rascunho
              </Button>
            )}
            
            {onNext && (
              <Button onClick={onNext} disabled={!canGoForward || isSaving} className="w-full md:w-auto gap-sm">
                {isLastStep ? 'Concluir' : 'Continuar'} 
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </footer>

      </div>
    </div>
  )
}
