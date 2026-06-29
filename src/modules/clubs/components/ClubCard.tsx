import type { Club } from '@/modules/clubs/types'
import { Link } from 'react-router-dom'

export function ClubCard({ club }: { club: Club }) {
  return (
    <div className="glass-card p-md rounded-lg">
      <div className="flex items-center gap-md">
        <div className="w-12 h-12 rounded-full bg-[#0b1c30] flex items-center justify-center font-bold text-sm">
          {club.short_name ? club.short_name.substring(0,2).toUpperCase() : club.name?.substring(0,2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{club.name}</h4>
          <p className="text-xs text-on-surface-variant">{club.city} • {club.country}</p>
        </div>
        <Link to={`/clubs/${club.slug || club.id}`} className="text-primary text-xs font-semibold">Ver</Link>
      </div>
    </div>
  )
}
