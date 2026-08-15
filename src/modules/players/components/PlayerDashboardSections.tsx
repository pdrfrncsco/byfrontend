import type { ReactNode } from 'react'
import { Activity, FileText, HeartPulse, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePlayerAgentsQuery, usePlayerCareer, usePlayerContractsQuery, usePlayerMedicalQuery } from '../hooks'

interface Props { slug: string; playerId: string }
const Message = ({ children }: { children: ReactNode }) => <p className="text-sm text-on-surface-variant">{children}</p>

export function PlayerDashboardSections({ slug, playerId }: Props) {
  const career = usePlayerCareer(slug)
  const contracts = usePlayerContractsQuery(playerId)
  const agents = usePlayerAgentsQuery(playerId)
  const medical = usePlayerMedicalQuery(playerId)

  return <Card variant="flat" padding="none"><Tabs defaultValue="career">
    <TabsList className="flex flex-wrap gap-sm rounded-none border-b border-outline-variant/30 p-md">
      <TabsTrigger value="career"><Activity className="h-4 w-4" />Carreira</TabsTrigger>
      <TabsTrigger value="contracts"><FileText className="h-4 w-4" />Contratos</TabsTrigger>
      <TabsTrigger value="agents"><UserRound className="h-4 w-4" />Agentes</TabsTrigger>
      <TabsTrigger value="medical"><HeartPulse className="h-4 w-4" />Médico</TabsTrigger>
      <TabsTrigger value="privacy"><Lock className="h-4 w-4" />Privacidade</TabsTrigger>
    </TabsList>
    <TabsContent value="career" className="p-lg"><CardHeader className="p-0 pb-md"><CardTitle>Carreira</CardTitle></CardHeader>{career.isLoading ? <Message>A carregar carreira...</Message> : (career.data ?? []).length === 0 ? <Message>Sem registos de carreira.</Message> : <div className="space-y-sm">{career.data?.map((entry) => <div key={entry.id} className="grid gap-sm rounded-lg border border-outline-variant/30 p-md md:grid-cols-4"><div><p className="text-xs text-on-surface-variant">Clube</p><p className="font-medium">{entry.club_name}</p></div><div><p className="text-xs text-on-surface-variant">Época</p><p className="font-medium">{entry.season}</p></div><div><p className="text-xs text-on-surface-variant">Jogos</p><p className="font-medium">{entry.appearances}</p></div><div><p className="text-xs text-on-surface-variant">Golos</p><p className="font-medium">{entry.goals}</p></div></div>)}</div>}</TabsContent>
    <TabsContent value="contracts" className="p-lg"><CardHeader className="p-0 pb-md"><CardTitle>Contratos</CardTitle></CardHeader>{contracts.isLoading ? <Message>A carregar contratos...</Message> : (contracts.data ?? []).length === 0 ? <Message>Sem contratos registados.</Message> : <div className="space-y-sm">{contracts.data?.map((contract) => <div key={contract.id} className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-outline-variant/30 p-md"><div><p className="font-medium">{contract.club_name}</p><p className="text-xs text-on-surface-variant">{contract.start_date} — {contract.end_date}</p></div><Badge variant={contract.status === 'active' ? 'success' : 'secondary'}>{contract.status}</Badge></div>)}</div>}</TabsContent>
    <TabsContent value="agents" className="p-lg"><CardHeader className="p-0 pb-md"><CardTitle>Agentes</CardTitle></CardHeader>{agents.isLoading ? <Message>A carregar agentes...</Message> : (agents.data ?? []).length === 0 ? <Message>Sem agentes associados.</Message> : <div className="space-y-sm">{agents.data?.map((relationship) => <div key={relationship.id} className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-md"><div><p className="font-medium">{relationship.agent_name}</p><p className="text-xs text-on-surface-variant">Desde {relationship.start_date}</p></div><Badge variant="secondary">{relationship.status}</Badge></div>)}</div>}</TabsContent>
    <TabsContent value="medical" className="p-lg"><CardHeader className="p-0 pb-md"><CardTitle>Estado médico</CardTitle></CardHeader>{medical.isLoading ? <Message>A carregar estado médico...</Message> : medical.data ? <div className="grid gap-md md:grid-cols-3"><div><p className="text-xs text-on-surface-variant">Estado</p><p className="font-medium">{medical.data.medical_status}</p></div><div><p className="text-xs text-on-surface-variant">Apto para jogar</p><p className="font-medium">{medical.data.is_fit_to_play ? 'Sim' : 'Não'}</p></div><div><p className="text-xs text-on-surface-variant">Último exame</p><p className="font-medium">{medical.data.last_medical_exam ?? '—'}</p></div></div> : <Message>Perfil médico ainda não registado.</Message>}</TabsContent>
    <TabsContent value="privacy" className="p-lg"><CardHeader className="p-0 pb-md"><CardTitle className="flex items-center gap-sm"><ShieldCheck className="h-5 w-5" />Privacidade</CardTitle></CardHeader><Message>As definições de visibilidade são geridas na página de definições.</Message></TabsContent>
  </Tabs></Card>
}
