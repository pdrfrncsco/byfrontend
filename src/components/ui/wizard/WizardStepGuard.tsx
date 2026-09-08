import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface WizardStepGuardProps {
  currentStepId: string
  requiredCompletedSteps: string[]
  completedSteps: string[]
  fallbackRoute: string
  children: React.ReactNode
}

export function WizardStepGuard({
  currentStepId,
  requiredCompletedSteps,
  completedSteps,
  fallbackRoute,
  children
}: WizardStepGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    // Check if all required steps are in the completed steps array
    const hasRequired = requiredCompletedSteps.every(step => completedSteps.includes(step));
    setCanAccess(hasRequired);
    setIsChecking(false);
  }, [requiredCompletedSteps, completedSteps]);

  if (isChecking) {
    return <div className="p-lg flex justify-center text-on-surface-variant">Verificando estado...</div>
  }

  if (!canAccess) {
    return <Navigate to={fallbackRoute} replace />
  }

  return <>{children}</>
}
