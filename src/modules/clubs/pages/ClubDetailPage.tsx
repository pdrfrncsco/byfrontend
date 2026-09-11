import { useEffect, useMemo } from 'react'
import { useSeo } from '@/hooks/useSeo'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2, ExternalLink, FileText, MapPin, Trophy, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { NotFound, PermissionDenied, ServerError } from '@/components/ui/error-states'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  SportDetailLayout,
  SportEntityHeader,
  SportTabs,
  SportTabsList,
  SportTabsTrigger,
  SportTabsContent,
} from '@/modules/shared/components/sport'
import { ClubOverviewTab } from '@/modules/clubs/components/ClubOverviewTab'
import { ClubSquadTable } from '@/modules/clubs/components/ClubSquadTable'
import { ClubMatchesList } from '@/modules/clubs/components/ClubMatchesList'
import { ClubInfoSidebar } from '@/modules/clubs/components/ClubInfoSidebar'
import { ClubCompetitionsView } from '@/modules/clubs/components/ClubCompetitionsView'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'
import { resolveMediaUrl } from '@/lib/media'
import {
  useClub,
  useClubKpis,
  useClubPublicDocuments,
  useClubPublicSponsors,
  useClubStaff,
  useClubSquad,
  useClubPublicCompetitions,
  useClubPublicMatches,
  useClubPublicStandings,
} from '@/modules/clubs/hooks/useClubs'
import { MediaGalleryTab } from '@/modules/media_manager/components'

// Helper function to detect UUID format
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

function ClubBreadcrumb({ current = 'Detalhe' }: { current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-sm text-on-surface-variant">
      <Link to="/clubs" className="hover:text-primary">Clubes</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page" className="truncate text-on-surface">{current}</span>
    </nav>
  )
}

export default function ClubDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clubSlug = id || ''

  // If UUID is detected in the URL, extract slug from the data and redirect
  const shouldFetchByUuid = isUUID(clubSlug)
  
  const clubQuery = useClub(clubSlug)
  useSeo({
    title: clubQuery.data?.name ? `${clubQuery.data.name} — Clube` : 'Detalhe do clube',
    description: clubQuery.data?.description || 'Consulte o perfil público, plantel e atividade deste clube.',
    path: `/clubs/${clubSlug}`,
  })
  const kpisQuery = useClubKpis(clubSlug)
  const squadQuery = useClubSquad(clubSlug)
  const staffQuery = useClubStaff(clubSlug)
  const documentsQuery = useClubPublicDocuments(clubSlug)
  const sponsorsQuery = useClubPublicSponsors(clubSlug)

  const competitionsQuery = useClubPublicCompetitions(clubSlug)
  const matchesQuery = useClubPublicMatches(clubSlug)
  const standingsQuery = useClubPublicStandings(clubSlug)

  const club = clubQuery.data
  const squad = squadQuery.data ?? []
  const staff = staffQuery.data ?? []
  const documents = documentsQuery.data ?? []
  const sponsors = sponsorsQuery.data ?? []

  const competitions = competitionsQuery.data ?? []
  const matches = matchesQuery.data ?? []
  const standings = standingsQuery.data ?? []

  // Redirect to slug if UUID was detected and club data is loaded
  useEffect(() => {
    if (shouldFetchByUuid && club?.slug && club.slug !== clubSlug) {
      navigate(`/clubs/${club.slug}`, { replace: true })
    }
  }, [shouldFetchByUuid, club?.slug, clubSlug, navigate])


  const errorStatus = useMemo(() => {
    const error = clubQuery.error as { response?: { status?: number } } | undefined
    return error?.response?.status
  }, [clubQuery.error])

  // --- Loading state ---
  if (clubQuery.isLoading) {
    return (
      <SportDetailLayout
        breadcrumb={<ClubBreadcrumb current="A carregar..." />}
        header={<PageSkeleton variant="detail" />}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  // --- Error states ---
  if (clubQuery.isError) {
    const errorContent = (() => {
      if (errorStatus === 403) return <PermissionDenied onAction={() => navigate('/clubs')} />
      if (errorStatus === 404) return <NotFound resourceName="clube" onAction={() => navigate('/clubs')} />
      return <ServerError onRetry={() => clubQuery.refetch()} />
    })()

    return (
      <SportDetailLayout
        breadcrumb={<ClubBreadcrumb />}
        header={errorContent}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  if (!club) {
    return (
      <SportDetailLayout
        breadcrumb={<ClubBreadcrumb />}
        header={
          <EmptyState
            title="Clube não encontrado"
            description="Não foi possível encontrar informação para este clube."
            action={{ label: 'Ver todos os clubes', onClick: () => navigate('/clubs') }}
          />
        }
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  return (
    <SportDetailLayout
      breadcrumb={<ClubBreadcrumb current={club.name} />}
      header={
        <SportEntityHeader
          visual={
            <ClubLogo
              name={club.name}
              logoUrl={club.logo_url}
              shortName={club.short_name}
              primaryColor={club.primary_color}
              size="xl"
              shape="squircle"
              className="border border-outline-variant/20 bg-surface-container-high shadow-md"
            />
          }
          title={club.name}
          subtitle={club.description || 'Perfil público do clube.'}
          chips={[
            { icon: MapPin, label: [club.city, club.country].filter(Boolean).join(' • ') || 'Localização indisponível' },
            { label: club.tenant_name || club.tenant_slug || 'Organização não indicada' },
            { label: club.status_label || club.status || 'active' },
            { label: club.is_verified ? '✓ Verificado' : 'Público' },
          ]}
          actions={
            <div className="flex flex-wrap gap-sm">
              {club.website && (
                <Button asChild variant="secondary" size="sm">
                  <a href={club.website} target="_blank" rel="noreferrer">
                    Website
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          }
        />
      }
      main={
        <SportTabs defaultValue="overview">
          <SportTabsList>
            <SportTabsTrigger value="overview">Visão Geral</SportTabsTrigger>
            <SportTabsTrigger value="squad">Plantel</SportTabsTrigger>
            <SportTabsTrigger value="matches">Jogos</SportTabsTrigger>
            <SportTabsTrigger value="staff">Staff</SportTabsTrigger>
            <SportTabsTrigger value="documents">Documentos</SportTabsTrigger>
            <SportTabsTrigger value="gallery">Galeria</SportTabsTrigger>
          </SportTabsList>

          <SportTabsContent value="overview">
            <ClubOverviewTab
              club={club}
              matches={matches}
              standings={standings}
              competitions={competitions}
              kpis={kpisQuery.data}
              isLoading={competitionsQuery.isLoading || matchesQuery.isLoading || standingsQuery.isLoading}
            />
          </SportTabsContent>

          <SportTabsContent value="squad">
            <ClubSquadTable squad={squad} clubSlug={club.slug} />
          </SportTabsContent>

          <SportTabsContent value="matches">
            <ClubMatchesList matches={matches} />
          </SportTabsContent>

          <SportTabsContent value="staff">
            {staff.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Staff indisponível"
                description="Não há membros do staff publicados para este clube."
              />
            ) : (
              <div className="space-y-1">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container px-4 py-3 hover:bg-surface-container-low transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-on-surface">{member.display_name}</p>
                      <p className="text-xs text-on-surface-variant">{member.role_label || member.role || 'Staff'}</p>
                    </div>
                    <span className="text-xs text-on-surface-variant">{formatDate(member.joined_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </SportTabsContent>

          <SportTabsContent value="documents">
            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Documentos indisponíveis"
                description="Não existem documentos públicos associados a este clube."
              />
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-sm">
                        <p className="text-sm font-medium text-on-surface">{document.title}</p>
                        <Badge variant="outline">{document.category_label || document.category}</Badge>
                        {document.is_public && <Badge variant="primary">Público</Badge>}
                      </div>
                      <p className="text-xs text-on-surface-variant">Validade: {formatDate(document.valid_until)}</p>
                    </div>
                    {document.asset_url && (
                      <Button asChild variant="secondary" size="sm">
                        <a href={document.asset_url} target="_blank" rel="noreferrer">Abrir</a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SportTabsContent>

          <SportTabsContent value="gallery">
            <MediaGalleryTab
              ownerType="club"
              ownerId={club.id}
              title={`Galeria de Fotos • ${club.name}`}
              emptyTitle="Sem fotos na galeria"
              emptyDescription="Este clube ainda não publicou fotos na galeria pública."
            />
          </SportTabsContent>
        </SportTabs>
      }
      sidebar={
        <ClubInfoSidebar
          club={club}
          kpis={kpisQuery.data}
          competitions={competitions}
          sponsors={sponsors}
        />
      }
    />
  )
}
