import { useEffect, useMemo, useRef, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit3, Search, Trash2, Users } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  FormField,
  Input,
  Select,
  Skeleton,
} from '@/components/ui'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { useClubMe, useAddClubMember, useUpdateClubMember, useRemoveClubMember, useClubMembers } from '@/modules/clubs/hooks/useClubs'
import { clubMemberSchema, type ClubMemberFormData } from '@/modules/clubs/schemas'
import type { ClubMember } from '@/modules/clubs/types'

function roleOptions() {
  return [
    { value: 'coach', label: 'Treinador' },
    { value: 'assistant_coach', label: 'Treinador Adjunto' },
    { value: 'manager', label: 'Gestor' },
    { value: 'physio', label: 'Fisioterapeuta' },
    { value: 'staff', label: 'Staff' },
    { value: 'president', label: 'Presidente' },
  ]
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

function toDefaults(member?: ClubMember | null): ClubMemberFormData {
  return {
    full_name: member?.full_name || member?.display_name || '',
    role: (member?.role as ClubMemberFormData['role']) || 'staff',
    jersey_number: member?.jersey_number ?? '',
    position: member?.position || '',
    is_active: member?.is_active ?? true,
  }
}

export default function ClubMembersPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()
  const slug = club?.slug
  const { data: members, isLoading } = useClubMembers(slug)
  const addMutation = useAddClubMember()
  const updateMutation = useUpdateClubMember()
  const removeMutation = useRemoveClubMember()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingMember, setEditingMember] = useState<ClubMember | null>(null)
  const formCardRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClubMemberFormData>({
    resolver: zodResolver(clubMemberSchema),
    defaultValues: toDefaults(),
  })

  useEffect(() => {
    reset(toDefaults(editingMember))
  }, [editingMember, reset])

  const sidebarLinks = getClubSidebarLinks()

  const memberRows = useMemo(() => {
    const list = Array.isArray(members) ? members : []
    return list.filter((member) => {
      const query = search.trim().toLowerCase()
      const name = (member.display_name || member.full_name || '').toLowerCase()
      const memberRole = (member.role || '').toLowerCase()
      const matchesSearch = !query || name.includes(query)
      const matchesRole = roleFilter === 'all' || memberRole === roleFilter
      return matchesSearch && matchesRole
    })
  }, [members, search, roleFilter])
  const hasFilters = search.trim() !== '' || roleFilter !== 'all'

  const columns = useMemo<ColumnDef<ClubMember>[]>(() => [
    {
      id: 'member',
      header: 'Membro',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-on-surface">
            {row.original.display_name || row.original.full_name || 'Sem nome'}
          </p>
          <p className="text-xs text-on-surface-variant">{row.original.position_label || row.original.position || 'Sem posição'}</p>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Função',
      cell: ({ row }) => <Badge variant="secondary">{roleLabel(row.original.role)}</Badge>,
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'primary' : 'outline'}>
          {row.original.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const memberName = row.original.display_name || row.original.full_name || 'membro'
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Editar ${memberName}`}
              onClick={() => setEditingMember(row.original)}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remover ${memberName}`}
              className="text-error hover:bg-error-container/20 hover:text-error"
              onClick={() => {
                if (!slug) return
                if (window.confirm(`Remover ${memberName}?`)) {
                  removeMutation.mutate({ slug, memberId: row.original.id })
                }
              }}
              disabled={removeMutation.isPending}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )
      },
    },
  ], [removeMutation, slug])

  const onSubmit = (data: ClubMemberFormData) => {
    if (!slug) return
    const payload = {
      full_name: data.full_name,
      role: data.role,
      jersey_number: data.jersey_number === '' ? undefined : Number(data.jersey_number),
      position: data.position || undefined,
      is_active: data.is_active,
    }

    if (editingMember) {
      updateMutation.mutate(
        { slug, memberId: editingMember.id, data: payload },
        {
          onSuccess: () => {
            setEditingMember(null)
            reset(toDefaults())
          },
        },
      )
      return
    }

    addMutation.mutate(
      { slug, data: payload },
      {
        onSuccess: () => {
          reset(toDefaults())
          formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        },
      },
    )
  }

  if (clubLoading || !club) {
    return (
      <DashboardLayout title="Membros do Clube" subtitle="Carregando gestão de membros..." dashboardType="club" sidebarLinks={sidebarLinks}>
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Membros • ${club.name}`}
      subtitle="Adicione, edite e mantenha o plantel e staff do clube com uma vista clara e rápida."
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
              Gestão de membros
            </div>
            <div className="space-y-sm">
              <h1 className="text-3xl font-semibold text-on-surface">Plantel e equipa técnica</h1>
              <p className="max-w-2xl text-on-surface-variant">
                Organize papéis, números e estado de cada membro num fluxo único, sem perder tempo entre ecrãs.
              </p>
            </div>
          </div>
          <div className="grid gap-sm sm:grid-cols-3">
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Total</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{Array.isArray(members) ? members.length : 0}</p>
            </Card>
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Filtro</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{memberRows.length}</p>
            </Card>
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Estado</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">Ativo</p>
            </Card>
          </div>
        </section>

        <div className="grid gap-lg xl:grid-cols-[0.9fr_1.1fr]">
          <Card ref={formCardRef} variant="flat" padding="none">
            <CardHeader>
              <CardTitle>{editingMember ? 'Editar membro' : 'Novo membro'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Nome completo" htmlFor="full_name" error={errors.full_name?.message} required>
                  <Input id="full_name" {...register('full_name')} state={errors.full_name ? 'error' : 'default'} />
                </FormField>
                <div className="grid gap-md sm:grid-cols-2">
                  <FormField label="Função" htmlFor="role" error={errors.role?.message} required>
                    <Select id="role" {...register('role')} state={errors.role ? 'error' : 'default'}>
                      {roleOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Número" htmlFor="jersey_number" error={errors.jersey_number?.message}>
                    <Input id="jersey_number" type="number" {...register('jersey_number')} state={errors.jersey_number ? 'error' : 'default'} />
                  </FormField>
                </div>
                <FormField label="Posição" htmlFor="position" error={errors.position?.message}>
                  <Input id="position" {...register('position')} state={errors.position ? 'error' : 'default'} />
                </FormField>
                <div className="flex items-center gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container px-md py-3">
                  <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-outline-variant text-primary" />
                  <label htmlFor="is_active" className="text-sm text-on-surface-variant">Membro ativo</label>
                </div>
                <div className="flex flex-wrap gap-sm">
                  <Button type="submit" loading={addMutation.isPending || updateMutation.isPending} disabled={!isDirty && !editingMember}>
                    {editingMember ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  {editingMember && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingMember(null)
                        reset(toDefaults())
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Lista de membros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid gap-md md:grid-cols-[1fr_220px]">
                <FormField label="Pesquisar" htmlFor="member-search">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
                    <Input
                      id="member-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                      placeholder="Nome do membro"
                      aria-label="Pesquisar membro por nome"
                    />
                  </div>
                </FormField>
                <FormField label="Função" htmlFor="member-role">
                  <Select id="member-role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">Todas</option>
                    {roleOptions().map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              {isLoading ? (
                <div className="space-y-sm">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : memberRows.length === 0 ? (
                <EmptyState
                  title={hasFilters ? 'Sem resultados' : 'Sem membros registados'}
                  description={
                    hasFilters
                      ? 'Nenhum membro corresponde aos filtros atuais. Remova os filtros para ver a lista completa.'
                      : 'Adicione o primeiro membro para começar a estruturar o clube.'
                  }
                  icon={Users}
                    action={{
                    label: hasFilters ? 'Limpar filtros' : 'Focar formulário',
                    onClick: () => {
                      if (hasFilters) {
                        setSearch('')
                        setRoleFilter('all')
                        return
                      }
                      setEditingMember(null)
                      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      window.requestAnimationFrame(() => {
                        document.getElementById('full_name')?.focus()
                      })
                    },
                  }}
                />
              ) : (
                <DataTable columns={columns} data={memberRows} isLoading={false} emptyMessage="Sem membros." enableSorting={false} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
