import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WizardState<TData> {
  currentStepIndex: number
  completedSteps: string[]
  draftData: Partial<TData>
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: string | null
  
  // Actions
  setStep: (stepIndex: number) => void
  updateData: (partialData: Partial<TData>) => void
  markStepCompleted: (stepId: string) => void
  setIsSaving: (isSaving: boolean) => void
  setLastSavedAt: (timestamp: string) => void
  reset: () => void
}

export function createWizardStore<TData>(name: string) {
  return create<WizardState<TData>>()(
    persist(
      (set) => ({
        currentStepIndex: 0,
        completedSteps: [],
        draftData: {},
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
        
        setStep: (stepIndex) => set({ currentStepIndex: stepIndex }),
        
        updateData: (partialData) => 
          set((state) => ({ 
            draftData: { ...state.draftData, ...partialData },
            isDirty: true 
          })),
          
        markStepCompleted: (stepId) => 
          set((state) => ({
            completedSteps: state.completedSteps.includes(stepId) 
              ? state.completedSteps 
              : [...state.completedSteps, stepId]
          })),
          
        setIsSaving: (isSaving) => 
          set((state) => ({ 
            isSaving, 
            isDirty: isSaving ? state.isDirty : false 
          })),
          
        setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),
        
        reset: () => set({ 
          currentStepIndex: 0, 
          completedSteps: [], 
          draftData: {}, 
          isDirty: false, 
          isSaving: false, 
          lastSavedAt: null 
        }),
      }),
      {
        name: `wizard-storage-${name}`, // unique persistence key
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
}
