import { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Settings, Shield, Trophy, Users, UserMinus, UserPlus } from 'lucide-react'
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
import {
  useOrganizationMembers,
  useAddMember,
  useRemoveMember,
} from '../hooks'
import type { OrgMember } from '../types'

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

function RoleBadge({ role }: { role: string }) {
  const r = role?.toLowerCase()
  if (r === 'admin' || r === 'owner') {
    return <Badge variant="success">{role}</Badge>
  }
  return <Badge variant="default">{role || 'Membro'}</Badge>
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="danger">Inativo</Badge>
  )
}

export function OrganizationMembersPage() {
  const { data: members, isLoading } = useOrganizationMembers()
  const addMember = useAddMember()
  const removeMember = useRemoveMember()

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Clubes Associados', href: ROUTES.CLUBS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Competições', href: ROUTES.COMPETITIONS, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS, icon: <Users className="h-4 w-4" />, active: true },
    { label: 'Pedidos de Filiação', href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
  ]

  const headerActions = (
    <Button
      variant="primary"
      size="sm"
      onClick={() => setShowInviteForm((v) => !v)}
    >
      <UserPlus className="h-4 w-4" />
      <span>Convidar Membro</span>
    </Button>
  )

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    addMember.mutate(
      { email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail('')
          setInviteRole('member')
          setShowInviteForm(false)
        },
      },
    )
  }

  const columns = useMemo<ColumnDef<OrgMember>[]>(
    () => [
      {
        id: 'member',
        header: 'Membro',
        cell: ({ row }) => {
          const { full_name, email } = row.original.user
          const initials = full_name
            ? full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
            : email.slice(0, 2).toUpperCase()
          return (
            <div className="flex items-center gap-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary text-[11px] font-bold">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm leading-tight">
                  {full_name || '—'}
                </p>
                <p className="text-[11px] text-on-surface-variant">{email}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'role',
        header: 'Papel',
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
      },
      {
        id: 'joined_at',
        header: 'Data de Entrada',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant font-data-tabular">
            {formatDate(row.original.joined_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error-container/20 hover:text-error"
            onClick={() => removeMember.mutate(row.original.id)}
            disabled={removeMember.isPending}
            title="Remover membro"
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [removeMember],
  )

  const memberRows = useMemo(() => (Array.isArray(members) ? members : []), [members])

  return (
    <DashboardLayout
      title="Membros da Organização"
      subtitle="Gira os utilizadores que têm acesso ao painel de administração da sua organização."
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="space-y-lg animate-fade-in">
        {/* Invite Form Card */}
        {showInviteForm && (
          <Card padding="md">
            <CardHeader className="pb-sm">
              <CardTitle>
                <UserPlus className="h-4 w-4 text-primary" />
                <span>Convidar Novo Membro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteSubmit} className="flex flex-col gap-md sm:flex-row sm:items-end">
                <FormField label="Endereço de Email" htmlFor="invite-email" className="flex-1">
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="utilizador@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Papel" htmlFor="invite-role" className="w-40">
                  <Select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                  </Select>
                </FormField>
                <div className="flex gap-sm pb-0.5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={addMember.isPending}
                  >
                    {addMember.isPending ? 'A enviar...' : 'Convidar'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members Table */}
        {isLoading ? (
          <Card padding="none">
            <div className="space-y-0 divide-y divide-outline-variant/20">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-3 w-40 rounded" />
                    <Skeleton className="h-3 w-56 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : memberRows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sem membros registados"
            description="Nenhum membro registado. Convide o primeiro membro da sua organização."
            action={{
              label: 'Convidar Membro',
              onClick: () => setShowInviteForm(true),
            }}
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={memberRows}
              isLoading={false}
              emptyMessage="Nenhum membro registado."
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
