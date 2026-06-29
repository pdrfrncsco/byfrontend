import type { ClubMember } from '@/modules/clubs/types'

export function ClubMembersList({ members }: { members: ClubMember[] }) {
  return (
    <div className="space-y-sm">
      {members.map((m) => (
        <div key={m.id} className="p-3 bg-[#0b1c30] rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{m.full_name || '—'}</p>
            <p className="text-xs text-on-surface-variant">{m.role} • #{m.jersey_number ?? '-'}</p>
          </div>
          <div className="text-xs text-on-surface-variant">{m.is_active ? 'Ativo' : 'Inativo'}</div>
        </div>
      ))}
    </div>
  )
}
