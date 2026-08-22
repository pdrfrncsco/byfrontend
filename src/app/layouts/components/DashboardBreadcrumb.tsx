import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Painel',
  organization: 'Organização',
  club: 'Clube',
  competition: 'Competição',
  competitions: 'Competições',
  players: 'Jogadores',
  player: 'Jogador',
  settings: 'Configurações',
  members: 'Membros',
  transfers: 'Transferências',
  matches: 'Partidas',
  'match-center': 'Match Center',
  'link-club': 'Pedidos de vínculo',
}

function getSegmentLabel(value: string) {
  return SEGMENT_LABELS[value] || value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function isTechnicalSegment(value: string) {
  return /^[0-9a-fA-F-]{8,36}$/.test(value) || /^\d+$/.test(value)
}

export function DashboardBreadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <nav className="hidden md:flex items-center gap-sm text-xs text-on-surface-variant">
      <Link to="/" className="hover:text-primary transition-colors">Início</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = value.charAt(0).toUpperCase() + value.slice(1)

        if (isTechnicalSegment(value)) return null

        return (
          <span key={to} className="flex items-center gap-sm">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-semibold text-primary">{getSegmentLabel(label.toLowerCase())}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">{getSegmentLabel(label.toLowerCase())}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
