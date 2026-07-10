# Plano de Implementação — Refatoração do Dashboard de Competições

Este documento descreve o plano detalhado para refatorar o **Dashboard de Competições** (`CompetitionDashboardPage.tsx`) para usar dados reais provenientes das APIs e hooks do TanStack Query, removendo os placeholders estáticos e adicionando interatividade premium com transições e navegação dinâmica.

---

## 🎯 Descrição do Objetivo

O ecrã do **Organizador de Competições** (`CompetitionDashboardPage.tsx`) atualmente exibe dados estáticos e ações não funcionais. O objetivo é torná-lo 100% dinâmico:
1. **Dados Reais de Torneios:** Utilizar o hook `useCompetitions()` para listar as competições reais do inquilino.
2. **KPIs Dinâmicos:** Calcular o total de competições, competições ativas e em rascunho em tempo real.
3. **Fluxos de Trabalho e Ações Rápidas:**
   - O botão "Criar Nova Competição" deve navegar para o formulário de criação `/dashboard/competitions/create`.
   - A listagem de "Torneios Ativos" deve permitir clicar em cada torneio para ir diretamente para a sua página pública de detalhe `/competitions/:id`.
   - O botão "Visualizar Todos os Torneios" no final da listagem deve redirecionar para a lista completa em `/competitions`.
4. **Estados de UI Resilientes:** Adicionar suporte a loading skeleton para evitar saltos de layout e tratar estados vazios de forma amigável com um botão de ação direta.

---

## 🛠️ Alterações Propostas

### 1. Modificar `CompetitionDashboardPage.tsx`
**Caminho do Ficheiro:** [CompetitionDashboardPage.tsx](file:///D:/ndeascloud/boayetu/frontend/src/modules/dashboards/pages/CompetitionDashboardPage.tsx)

Substituir o estado estático pelo carregamento dinâmico via React Query e associar os links corretos utilizando `<Link>` do `react-router-dom`.

#### Código Proposto:

```tsx
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useCompetitions } from '@/modules/competitions/hooks/useCompetitions'
import { ROUTES } from '@/constants'
import { 
  Home, 
  Trophy, 
  Calendar, 
  Gavel, 
  MapPin, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Award,
  PlusCircle,
  Loader2,
  FolderOpen
} from 'lucide-react'

const STATUS_CONFIG = {
  draft: { label: 'RASCUNHO', className: 'text-amber-500 bg-amber-500/10' },
  active: { label: 'EM CURSO', className: 'text-emerald-500 bg-emerald-500/10' },
  completed: { label: 'CONCLUÍDO', className: 'text-slate-400 bg-slate-500/10' },
}

const TYPE_LABELS = {
  league: 'Campeonato',
  tournament: 'Torneio',
  cup: 'Taça',
}

export function CompetitionDashboardPage() {
  const { data: competitions = [], isLoading } = useCompetitions()

  const sidebarLinks = [
    { label: 'Geral', href: '#home', icon: <Home className="w-5 h-5" />, active: true },
    { label: 'Torneios', href: '#tournaments', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Partidas', href: '#matches', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Árbitros', href: '#referees', icon: <Gavel className="w-5 h-5" /> },
    { label: 'Estádios', href: '#venues', icon: <MapPin className="w-5 h-5" /> },
    { label: 'Conformidade', href: '#compliance', icon: <ShieldAlert className="w-5 h-5" /> },
  ]

  const headerActions = (
    <Link to={ROUTES.COMPETITION_CREATE}>
      <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold flex items-center gap-xs hover:brightness-110 transition-all text-xs">
        <PlusCircle className="w-4 h-4" />
        Criar Nova Competição
      </button>
    </Link>
  )

  // KPIs Dinâmicos
  const totalCompetitions = competitions.length
  const activeCompetitions = competitions.filter(c => c.status === 'active').length
  const draftCompetitions = competitions.filter(c => c.status === 'draft').length

  // Mostrar apenas competições ativas na secção principal (ou as mais recentes se não houver ativas)
  const activeList = competitions
    .filter(c => c.status === 'active')
    .slice(0, 3)

  const displayList = activeList.length > 0 ? activeList : competitions.slice(0, 3)

  return (
    <DashboardLayout
      title="Organizador de Competições"
      subtitle="Gestão desportiva de torneios, escalamento de arbitragem, vistorias de recintos e conformidade técnica."
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Tournament Management block */}
        <section className="glass-card rounded-xl p-md lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Torneios Ativos</h3>
              <span className="text-xs text-on-surface-variant font-semibold">
                {activeCompetitions} Competiç{activeCompetitions === 1 ? 'ão' : 'ões'} em Curso
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : displayList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-xl text-center text-on-surface-variant">
                <FolderOpen className="w-10 h-10 opacity-30 mb-sm" />
                <p className="text-sm font-semibold">Nenhuma competição registada</p>
                <p className="text-xs opacity-75 mt-xs">Crie a sua primeira competição para começar.</p>
              </div>
            ) : (
              <div className="space-y-sm text-xs">
                {displayList.map(comp => {
                  const statusCfg = STATUS_CONFIG[comp.status] ?? STATUS_CONFIG.draft
                  const typeLabel = TYPE_LABELS[comp.competition_type] ?? comp.competition_type
                  
                  return (
                    <Link
                      key={comp.id}
                      to={ROUTES.COMPETITION_DETAIL(comp.id)}
                      className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center justify-between hover:border-primary/40 hover:bg-[#102034] transition-all group"
                    >
                      <div>
                        <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {comp.name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          Época {comp.season} • {typeLabel}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
          
          <Link to={ROUTES.COMPETITIONS} className="w-full mt-lg">
            <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
              Visualizar Todos os Torneios <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </section>

        {/* Referee and Technical Delegation */}
        <section className="glass-card rounded-xl p-md lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Escalamento de Arbitragem</h3>
              <Gavel className="text-primary w-5 h-5" />
            </div>
            
            <div className="space-y-sm text-xs">
              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30">
                <p className="font-semibold text-on-surface">Jogo: Petro de Luanda vs 1º de Agosto</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Árbitro: Manuel Dembo (Elite FIFA)</p>
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider block mt-1">NOMEAÇÃO ATRIBUÍDA</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 opacity-70">
                <p className="font-semibold text-on-surface">Jogo: Wiliete SC vs Desp. Huíla</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Árbitro: Teresa Kiala (VAR)</p>
                <span className="text-[9px] text-[#e9c349] font-bold uppercase tracking-wider block mt-1">AGUARDA CONFIRMAÇÃO</span>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-lg flex items-center justify-center gap-1">
            Painel de Nomeação Arbitral
          </button>
        </section>
      </div>

      {/* KPI Cards / Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-lg">
        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Total Torneios</p>
            <h3 className="font-display text-xl font-bold">
              {isLoading ? '...' : `${totalCompetitions} registado${totalCompetitions === 1 ? '' : 's'}`}
            </h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Torneios Ativos</p>
            <h3 className="font-display text-xl font-bold">
              {isLoading ? '...' : `${activeCompetitions} em curso`}
            </h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Em Rascunho</p>
            <h3 className="font-display text-xl font-bold">
              {isLoading ? '...' : `${draftCompetitions} planeado${draftCompetitions === 1 ? '' : 's'}`}
            </h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

## 🎯 Plano de Verificação

### Testes Automatizados
* Correr o comando `npm run build` na pasta `frontend/` para validar a tipagem estática e garantir que o import do hook e constantes resolve corretamente.

### Validação Manual
O utilizador pode iniciar o servidor de desenvolvimento (`npm run dev`) e verificar:
1. **Navegação:** Se ao clicar em "Criar Nova Competição" navega corretamente para a página de criação.
2. **Navegação de Torneios:** Se ao clicar num torneio listado, navega para `/competitions/:id`.
3. **KPIs:** Se os números exibidos coincidem com o número total de competições registadas no sistema.
4. **Resiliência:** O spinner de loading é exibido enquanto os dados do TanStack Query estão a ser resolvidos.
