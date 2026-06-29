import { useParams } from 'react-router-dom'
import { useClub, useClubMembers } from '@/modules/clubs/hooks/useClubs'
import { ClubMembersList } from '@/modules/clubs/components/ClubMembersList'

export default function ClubDetailPage() {
  const { id } = useParams()
  const { data: club } = useClub(id as string)
  const { data: members = [] } = useClubMembers(id as string)

  if (!club) return <div className="container py-lg">Carregando...</div>

  return (
    <div className="container py-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          <h1 className="font-display text-2xl mb-md">{(club as any).name}</h1>
          <p className="text-sm text-on-surface-variant mb-md">{(club as any).description}</p>

          <section className="glass-card p-md rounded-lg mb-md">
            <h3 className="font-semibold mb-sm">Plantel</h3>
            <ClubMembersList members={members as any} />
          </section>
        </div>

        <aside>
          <div className="glass-card p-md rounded-lg">
            <p className="text-xs text-on-surface-variant">Cidade</p>
            <h4 className="font-semibold">{(club as any).city}</h4>
            <p className="text-xs text-on-surface-variant mt-sm">Website</p>
            <a href={(club as any).website || '#'} className="text-primary text-xs">{(club as any).website}</a>
          </div>
        </aside>
      </div>
    </div>
  )
}
