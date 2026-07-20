import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { useClubMe, useClubKpis, useClubMembers, useClubSquad, useClubStaff } from '@/modules/clubs/hooks/useClubs'
import type { ClubMember, ClubSquadMember, ClubStaffMember } from '@/modules/clubs/types'

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

function roleLabel(role?: string | null) {
  switch (role) {
    case 'coach':
      return 'Treinador'
    case 'assistant_coach':
      return 'Treinador Adjunto'
    case 'manager':
      return 'Gestor'
    case 'physio':
      return 'Fisioterapeuta'
    case 'staff':
      return 'Staff'
    case 'president':
      return 'Presidente'
    default:
      return 'Membro'
  }
}

export default function ClubSquadPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()
  const slug = club?.slug
  const { data: kpis, isLoading: kpisLoading } = useClubKpis(slug)
  const { data: members, isLoading: membersLoading } = useClubMembers(slug)
  const { data: publicSquad, isLoading: publicSquadLoading } = useClubSquad(slug)
  const { data: publicStaff, isLoading: publicStaffLoading } = useClubStaff(slug)

  console.log('ClubSquadPage', { club, slug, members, membersLoading, publicSquad, publicStaff })

  const { players, staff } = useMemo(() => {
    const memberList = Array.isArray(members) ? members : []
    const fromMembersPlayers = memberList.filter((member) => member.is_active !== false && member.role === 'player')
    const fromMembersStaff = memberList.filter((member) => member.is_active !== false && member.role !== 'player')

    // If we have members, use that; otherwise use public data
    const finalPlayers = fromMembersPlayers.length > 0 ? fromMembersPlayers : (publicSquad || [])
    const finalStaff = fromMembersStaff.length > 0 ? fromMembersStaff : (publicStaff || [])

    return {
      players: finalPlayers,
      staff: finalStaff,
    }
  }, [members, publicSquad, publicStaff])

  const sidebarLinks = getClubSidebarLinks()

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Plantel"
        subtitle="Carregando plantel do clube..."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }


  return (
    <DashboardLayout
      title={`Plantel • ${club.name}`}
      subtitle="Veja o plantel e equipa técnica do clube, organizados e prontos para consultar."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/80 p-xl lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Users className="h-3.5 w-3.5" />
              Plantel e staff
            </div>
            <div className="space-y-sm">
              <h1 className="text-3xl font-semibold text-on-surface">Equipa completa</h1>
              <p className="max-w-2xl text-on-surface-variant">
                Visualize todos os jogadores e membros da equipa técnica, com os seus detalhes e funções claramente organizados.
              </p>
            </div>
          </div>
          {kpisLoading || !kpis ? (
            <div className="grid gap-sm sm:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : (
            <div className="grid gap-sm sm:grid-cols-3">
              <Card variant="flat" padding="md">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Plantel</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{players.length}</p>
              </Card>
              <Card variant="flat" padding="md">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Staff</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{staff.length}</p>
              </Card>
              <Card variant="flat" padding="md">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Total</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{players.length + staff.length}</p>
              </Card>
            </div>
          )}
        </section>

        <Tabs defaultValue="squad" className="space-y-lg">
          <TabsList className="h-auto flex flex-wrap gap-sm rounded-full border border-outline-variant/20 bg-surface-container/50 p-sm">
            <TabsTrigger 
              value="squad" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              Plantel
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="squad" 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {membersLoading || publicSquadLoading ? (
              <div className="space-y-sm">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            ) : players.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Plantel indisponível"
                description="Ainda não há jogadores registados no plantel do clube."
              />
            ) : (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {players.map((player: ClubMember | ClubSquadMember) => (
                  <Card key={player.id} variant="flat" padding="none" className="shadow-lg shadow-black/10">
                    <CardContent className="space-y-sm p-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-on-surface">
                          {'display_name' in player ? player.display_name : ('full_name' in player ? player.full_name : 'Sem nome')}
                        </p>
                        <Badge variant="primary">
                          {player.jersey_number ? `#${player.jersey_number}` : 'Sem número'}
                        </Badge>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {player.position_label || player.position || 'Posição não indicada'}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Entrada: {formatDate(player.joined_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent 
            value="staff" 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {membersLoading || publicStaffLoading ? (
              <div className="space-y-sm">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            ) : staff.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Staff indisponível"
                description="Ainda não há membros da equipa técnica registados no clube."
              />
            ) : (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {staff.map((member: ClubMember | ClubStaffMember) => (
                  <Card key={member.id} variant="flat" padding="none" className="shadow-lg shadow-black/10">
                    <CardContent className="space-y-sm p-lg">
                      <p className="font-semibold text-on-surface">
                        {'display_name' in member ? member.display_name : ('full_name' in member ? member.full_name : 'Sem nome')}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        {'role_label' in member ? member.role_label : ('role' in member ? roleLabel(member.role) : 'Staff')}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Entrada: {formatDate(member.joined_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
