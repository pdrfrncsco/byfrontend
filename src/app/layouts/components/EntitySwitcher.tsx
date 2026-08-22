import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { type NavContext } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface EntitySwitcherProps {
  context: NavContext
}

export function EntitySwitcher({ context }: EntitySwitcherProps) {
  const { user, memberships, activeMembershipId, setActiveMembership } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  // Se o utilizador apenas tiver um papel básico, não apresenta o seletor.
  if (!user || memberships.length === 0) {
    return null
  }

  const goToContext = (membershipId?: string) => {
    if (membershipId) setActiveMembership(membershipId)
    setOpen(false)
    navigate(
      context.type === 'club'
        ? ROUTES.DASHBOARD_CLUB
        : context.type === 'competition'
          ? ROUTES.DASHBOARD_COMPETITION
          : ROUTES.DASHBOARD_ORGANIZATION,
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Mudar contexto de painel"
        className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
      >
        <ChevronsUpDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container shadow-xl">
          <p className="border-b border-outline-variant/20 px-md py-sm text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Contextos disponíveis
          </p>
          {memberships.map((membership) => (
            <button
              key={membership.id}
              type="button"
              onClick={() => goToContext(membership.id)}
              className="flex w-full items-start gap-sm px-md py-sm text-left text-sm transition-colors hover:bg-surface-container-high"
            >
              <span className="min-w-0 flex-1 truncate text-on-surface">{membership.tenant_name}</span>
              {membership.id === activeMembershipId && <span className="text-xs text-primary">Ativo</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
