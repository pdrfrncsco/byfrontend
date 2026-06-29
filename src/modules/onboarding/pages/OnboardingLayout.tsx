import React from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  step?: number
}

export default function OnboardingLayout({ children, step = 1 }: Props) {
  const steps = [
    { label: 'Informação', path: '/onboarding' },
    { label: 'Branding', path: '/onboarding/branding' },
    { label: 'Competição', path: '/onboarding/competition' },
    { label: 'Revisão', path: '/onboarding/review' },
  ]

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <div className="max-w-6xl mx-auto p-lg">
        <div className="mb-lg">
          <h1 className="font-display-lg text-display-lg text-on-surface">Setup Wizard</h1>
          <p className="text-on-surface-variant">Passo {step} de {steps.length}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
          <aside className="hidden md:block md:col-span-1 bg-surface-container-high glass-card p-md rounded-xl">
            <nav className="flex flex-col gap-sm">
              {steps.map((s, idx) => (
                <Link
                  key={s.label}
                  to={s.path}
                  className={`px-md py-sm rounded-lg ${idx + 1 === step ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="md:col-span-3 space-y-lg">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
