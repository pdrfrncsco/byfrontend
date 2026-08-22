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
  const { user } = useAuth()
  const navigate = useNavigate()

  // Se o utilizador apenas tiver um papel básico, não apresenta o seletor.
  if (!user || (!user.roles?.includes('owner') && !user.roles?.includes('admin') && !user.roles?.includes('club_admin'))) {
    return null
  }

  return (
    <button
      onClick={() => navigate(ROUTES.DASHBOARD)}
      className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
      title="Mudar contexto de painel"
    >
      <ChevronsUpDown className="h-4 w-4" />
    </button>
  )
}
