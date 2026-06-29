import { ClubCard } from '@/modules/clubs/components/ClubCard'
import { useClubs } from '@/modules/clubs/hooks/useClubs'

export default function ClubListPage() {
  const { data: clubs = [] } = useClubs()

  return (
    <div className="container py-lg">
      <h2 className="font-display text-2xl mb-md">Clubes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        {Array.isArray(clubs)
          ? clubs.map((c: any) => <ClubCard key={c.id} club={c} />)
          : (clubs.results || []).map((c: any) => <ClubCard key={c.id} club={c} />)}
      </div>
    </div>
  )
}
