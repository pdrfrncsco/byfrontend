import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, ExternalLink, FileText, MapPin, Trophy, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { NotFound, PermissionDenied, ServerError } from '@/components/ui/error-states'
import { ClubEmptyState } from '@/modules/clubs/components/ClubEmptyState'
import { ClubDetailSkeleton } from '@/modules/clubs/components/ClubSkeleton'
import { ClubKpisCard } from '@/modules/clubs/components/ClubKpisCard'
import {
  useClub,
  useClubKpis,
  useClubPublicDocuments,
  useClubPublicSponsors,
  useClubStaff,
  useClubSquad,
} from '@/modules/clubs/hooks/useClubs'

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

function DetailStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-lg font-semibold text-on-surface">{value}</p>
    </div>
  )
}

export default function ClubDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clubSlug = id || ''

  const clubQuery = useClub(clubSlug)
  const kpisQuery = useClubKpis(clubSlug)
  const squadQuery = useClubSquad(clubSlug)
  const staffQuery = useClubStaff(clubSlug)
  const documentsQuery = useClubPublicDocuments(clubSlug)
  const sponsorsQuery = useClubPublicSponsors(clubSlug)

  const club = clubQuery.data
  const squad = squadQuery.data ?? []
  const staff = staffQuery.data ?? []
  const documents = documentsQuery.data ?? []
  const sponsors = sponsorsQuery.data ?? []

  const errorStatus = useMemo(() => {
    const error = clubQuery.error as { response?: { status?: number } } | undefined
    return error?.response?.status
  }, [clubQuery.error])

  if (clubQuery.isLoading) {
    return (
      <div className="container py-xl">
        <ClubDetailSkeleton />
      </div>
    )
  }

  if (clubQuery.isError) {
    if (errorStatus === 403) {
      return (
        <div className="container py-xl">
          <PermissionDenied onAction={() => navigate('/clubs')} />
        </div>
      )
    }

    if (errorStatus === 404) {
      return (
        <div className="container py-xl">
          <NotFound resourceName="clube" onAction={() => navigate('/clubs')} />
        </div>
      )
    }

    if (errorStatus === 500) {
      return (
        <div className="container py-xl">
          <ServerError onRetry={() => clubQuery.refetch()} />
        </div>
      )
    }

    return (
      <div className="container py-xl">
        <ServerError onRetry={() => clubQuery.refetch()} />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="container py-xl">
        <ClubEmptyState onReset={() => navigate('/clubs')} />
      </div>
    )
  }

  const initials = (club.short_name || club.name || '?').slice(0, 2).toUpperCase()

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.16),transparent_36%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_34%),linear-gradient(180deg,rgba(7,16,29,0.88),rgba(7,16,29,0.04))]" />
      <div className="container py-xl space-y-xl">
        <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container/75 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="grid gap-xl lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-high text-3xl font-bold text-primary shadow-lg">
              {club.logo_url ? (
                <img src={club.logo_url} alt={`${club.name} logo`} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="space-y-md">
              <div className="flex flex-wrap items-center gap-sm">
                <h1 className="font-title-lg text-3xl text-on-surface md:text-4xl">{club.name}</h1>
                <Badge variant={club.status === 'suspended' ? 'danger' : club.status === 'active' ? 'primary' : 'warning'}>
                  {club.status_label || club.status || 'active'}
                </Badge>
                {club.is_verified && <Badge variant="secondary">Verificado</Badge>}
              </div>

              <p className="max-w-3xl text-base leading-7 text-on-surface-variant">
                {club.description || 'Perfil público do clube com plantel, staff, documentos e patrocinadores.'}
              </p>

              <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                  <MapPin className="h-4 w-4" />
                  {[club.city, club.country].filter(Boolean).join(' • ') || 'Localização indisponível'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                  {club.tenant_name || club.tenant_slug || 'Organização não indicada'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-sm">
              {club.website && (
                <Button asChild variant="secondary">
                  <a href={club.website} target="_blank" rel="noreferrer">
                    Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/clubs')}>
                Voltar
              </Button>
            </div>
          </div>
        </section>

        {kpisQuery.data && <ClubKpisCard kpis={kpisQuery.data} />}

        <div className="grid gap-lg lg:grid-cols-[1.3fr_0.7fr]">
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Visão geral</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-md sm:grid-cols-2">
              <DetailStat label="Fundação" value={club.founded_year || 'N/A'} />
              <DetailStat label="Estádio" value={club.stadium_name || 'N/A'} />
              <DetailStat
                label="Capacidade"
                value={club.stadium_capacity ? `${club.stadium_capacity.toLocaleString('pt-AO')} lugares` : 'N/A'}
              />
              <DetailStat label="Contacto" value={club.email || club.phone || 'N/A'} />
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Resumo rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <DetailStat label="Estado" value={club.status_label || club.status || 'active'} />
              <DetailStat label="Atualizado em" value={formatDate(club.updated_at || club.created_at)} />
              <DetailStat label="Cidade" value={club.city || 'N/A'} />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="squad">
          <TabsList className="flex flex-wrap gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container/70 p-sm">
            <TabsTrigger value="squad">Plantel</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
          </TabsList>

          <TabsContent value="squad">
            {squad.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Plantel indisponível"
                description="Este clube ainda não publicou jogadores no perfil público."
              />
            ) : (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {squad.map((player) => (
                  <Card key={player.id} variant="flat" padding="none">
                    <CardContent className="space-y-sm p-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-on-surface">{player.display_name}</p>
                        <Badge variant="primary">{player.jersey_number ? `#${player.jersey_number}` : 'Sem número'}</Badge>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {player.position_label || player.position || 'Posição não indicada'}
                      </p>
                      <p className="text-xs text-on-surface-variant">Entrada: {formatDate(player.joined_at)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="staff">
            {staff.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Staff indisponível"
                description="Não há membros do staff publicados para este clube."
              />
            ) : (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {staff.map((member) => (
                  <Card key={member.id} variant="flat" padding="none">
                    <CardContent className="space-y-sm p-lg">
                      <p className="font-semibold text-on-surface">{member.display_name}</p>
                      <p className="text-sm text-on-surface-variant">{member.role_label || member.role || 'Staff'}</p>
                      <p className="text-xs text-on-surface-variant">Entrada: {formatDate(member.joined_at)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Documentos indisponíveis"
                description="Não existem documentos públicos associados a este clube."
              />
            ) : (
              <div className="space-y-sm">
                {documents.map((document) => (
                  <Card key={document.id} variant="flat" padding="none">
                    <CardContent className="flex flex-col gap-md p-lg md:flex-row md:items-center md:justify-between">
                      <div className="space-y-xs">
                        <div className="flex flex-wrap items-center gap-sm">
                          <p className="font-semibold text-on-surface">{document.title}</p>
                          <Badge variant="outline">{document.category_label || document.category}</Badge>
                          {document.is_public && <Badge variant="primary">Público</Badge>}
                        </div>
                        <p className="text-sm text-on-surface-variant">{document.description || 'Sem descrição'}</p>
                        <p className="text-xs text-on-surface-variant">Validade: {formatDate(document.valid_until)}</p>
                      </div>
                      {document.asset_url && (
                        <Button asChild variant="secondary" size="sm">
                          <a href={document.asset_url} target="_blank" rel="noreferrer">
                            Abrir ficheiro
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sponsors">
            {sponsors.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Patrocinadores indisponíveis"
                description="Este clube ainda não publicou patrocinadores no perfil público."
              />
            ) : (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {sponsors.map((sponsor) => (
                  <Card key={sponsor.id} variant="flat" padding="none">
                    <CardContent className="space-y-sm p-lg">
                      <div className="flex items-center gap-md">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface-container-high text-sm font-bold text-primary">
                          {sponsor.logo_url ? (
                            <img src={sponsor.logo_url} alt={sponsor.name} className="h-full w-full object-cover" />
                          ) : (
                            sponsor.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{sponsor.name}</p>
                          <p className="text-sm text-on-surface-variant">
                            {sponsor.sponsor_type_label || sponsor.sponsor_type}
                          </p>
                        </div>
                      </div>
                      {sponsor.website && (
                        <a className="text-sm font-medium text-primary" href={sponsor.website} target="_blank" rel="noreferrer">
                          Visitar website
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
