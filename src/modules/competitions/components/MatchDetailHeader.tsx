import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { MatchScoreboard } from './MatchScoreboard'
import { MatchLifecycleStepper } from './MatchLifecycleStepper'
import type { Match } from '../types'

interface MatchDetailHeaderProps {
  match: Match
  backTo: string
  children?: ReactNode
}

export function MatchDetailHeader({ match, backTo, children }: MatchDetailHeaderProps) {
  return (
    <header className="mb-lg rounded-2xl border border-outline-variant/20 bg-surface-container">
      <div className="mx-auto max-w-5xl px-lg py-lg">

        <MatchScoreboard match={match} />
        {children}
        <div className="mt-lg">
          <MatchLifecycleStepper match={match} />
        </div>
      </div>
    </header>
  )
}

export function MatchHeaderAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <Button variant="secondary" size="sm" onClick={onClick}>{children}</Button>
}
