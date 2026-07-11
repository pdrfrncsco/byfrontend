import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Building2,
  Palette,
  Trophy,
  Rocket,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { useOrganizationMe, useLaunchOrganization } from '@/modules/organizations'
import { useCompetitions } from '@/modules/competitions'
import type { CompetitionType } from '@/modules/competitions'
import { onboardingRoutes } from '../routes'
import { ROUTES } from '@/constants'

const COUNTRY_LABELS: Record<string, string> = {
  AO: 'Angola',
  MZ: 'Moçambique',
  PT: 'Portugal',
  BR: 'Brasil',
}

const TEAM_ESTIMATES: Record<CompetitionType, number> = {
  league: 20,
  tournament: 16,
  cup: 32,
}

function competitionStatusLabel(status?: string): string {
  if (status === 'active') return 'Ativa'
  if (status === 'completed') return 'Concluída'
  return 'Pronto'
}

export default function ReviewStep() {
  const navigate = useNavigate()
  const { data: org, isLoading: orgLoading } = useOrganizationMe()
  const { data: competitions, isLoading: compLoading } = useCompetitions()
  const launchOrg = useLaunchOrganization()

  const [launched, setLaunched] = useState(false)

  const isLoading = orgLoading || compLoading
  const hasCompetition = (competitions?.length ?? 0) > 0
  const canLaunch = Boolean(org?.name?.trim()) && hasCompetition
  const isAlreadyActive = org?.status === 'active'

  const location = [org?.city, COUNTRY_LABELS[org?.country ?? ''] ?? org?.country]
    .filter(Boolean)
    .join(', ') || '—'

  const primary = org?.primary_color || '#94D3C1'
  const secondary = org?.secondary_color || '#E9C349'
  const logoUrl = org?.logo_url || org?.logo

  async function handleLaunch() {
    if (!canLaunch || launchOrg.isPending) return

    try {
      const result = await launchOrg.mutateAsync()
      setLaunched(true)
      toast.success('Portal BolaYetu Pro lançado com sucesso!')
      if (result.competitions_activated > 0) {
        toast.info(`${result.competitions_activated} competição(ões) ativada(s).`)
      }
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (e) {
      console.error('Launch failed', e)
      toast.error('Erro ao lançar o portal. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <OnboardingLayout step={4}>
        <div>Carregando...</div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout step={4}>
      <div className="mb-xl">
        <span className="bg-primary/20 text-primary px-sm py-1 rounded-full font-label-sm uppercase tracking-widest">
          Revisão Final
        </span>
        <h2 className="font-display-lg text-display-lg text-on-surface mt-sm mb-xs">
          Quase lá, Comandante.
        </h2>
        <p className="text-on-surface-variant max-w-2xl">
          Revise as configurações do seu ecossistema digital antes do lançamento oficial.
          Todas as informações podem ser editadas posteriormente no painel administrativo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
        {/* Organization */}
        <div className="md:col-span-8 glass-card p-lg rounded-xl flex flex-col gap-md">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-sm">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-title-md text-title-md text-on-surface">Dados da Organização</h3>
            </div>
            <Link to={onboardingRoutes.root} className="text-primary hover:underline font-label-sm">
              Editar
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase mb-xs">Nome Oficial</p>
              <p className="font-title-md">{org?.name || '—'}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase mb-xs">Sede Regional</p>
              <p className="font-body-md">{location}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase mb-xs">Tipo de Entidade</p>
              <p className="font-body-md">{org?.type_label || org?.type || '—'}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-sm uppercase mb-xs">Slug / Portal</p>
              <p className="font-data-tabular">{org?.slug || '—'}</p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="md:col-span-4 glass-card p-lg rounded-xl flex flex-col gap-md">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-sm">
              <Palette className="w-5 h-5 text-tertiary" />
              <h3 className="font-title-md text-title-md text-on-surface">Identidade</h3>
            </div>
            <Link to={onboardingRoutes.branding} className="text-primary hover:underline font-label-sm">
              Editar
            </Link>
          </div>
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center border border-white/10">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-primary text-label-sm">Logo</span>
              )}
            </div>
            <div>
              <p className="font-title-md">Escudo Principal</p>
              <p className="text-on-surface-variant font-label-sm">
                {logoUrl ? 'Carregado' : 'Não definido'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-sm uppercase mb-sm">Paleta de Cores</p>
            <div className="flex gap-xs">
              <div className="w-full h-8 rounded-sm" style={{ background: primary }} />
              <div className="w-full h-8 bg-surface-container-low rounded-sm" />
              <div className="w-full h-8 rounded-sm" style={{ background: secondary }} />
            </div>
          </div>
        </div>

        {/* Competitions */}
        <div className="md:col-span-12 glass-card p-lg rounded-xl">
          <div className="flex justify-between items-center mb-lg">
            <div className="flex items-center gap-sm">
              <Trophy className="w-5 h-5 text-secondary" />
              <h3 className="font-title-md text-title-md text-on-surface">Competições Configuradas</h3>
            </div>
            <Link to={onboardingRoutes.competition} className="text-primary hover:underline font-label-sm">
              Gerenciar
            </Link>
          </div>

          {hasCompetition ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-md px-sm text-on-surface-variant font-label-sm uppercase">Nome da Competição</th>
                    <th className="py-md px-sm text-on-surface-variant font-label-sm uppercase">Categoria</th>
                    <th className="py-md px-sm text-on-surface-variant font-label-sm uppercase">Época</th>
                    <th className="py-md px-sm text-on-surface-variant font-label-sm uppercase">Equipas</th>
                    <th className="py-md px-sm text-on-surface-variant font-label-sm uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular">
                  {competitions!.map(comp => (
                    <tr key={comp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-md px-sm font-title-md font-bold">{comp.name}</td>
                      <td className="py-md px-sm">{comp.type_label || comp.competition_type}</td>
                      <td className="py-md px-sm">{comp.season}</td>
                      <td className="py-md px-sm">{TEAM_ESTIMATES[comp.competition_type]}</td>
                      <td className="py-md px-sm text-right text-primary">
                        {competitionStatusLabel(comp.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-on-surface-variant">
              Nenhuma competição configurada.{' '}
              <Link to={onboardingRoutes.competition} className="text-primary hover:underline">
                Criar competição
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Launch */}
      <div className="glass-card rounded-xl border border-primary/20 p-xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-lg">
          {launched || isAlreadyActive ? (
            <CheckCircle2 className="w-10 h-10 text-primary" />
          ) : (
            <Rocket className="w-10 h-10 text-primary" />
          )}
        </div>
        <h3 className="font-headline-lg mb-sm">Pronto para a Decolagem</h3>
        <p className="text-on-surface-variant mb-xl max-w-lg">
          Ao clicar no botão abaixo, seu ecossistema digital será gerado e os portais públicos
          estarão acessíveis para clubes e torcedores.
        </p>
        <button
          type="button"
          onClick={handleLaunch}
          disabled={!canLaunch || launchOrg.isPending || launched}
          className={`px-xl py-lg rounded-lg font-title-md font-bold transition-all shadow-lg ${
            launched || isAlreadyActive
              ? 'bg-tertiary-container text-on-tertiary pointer-events-none'
              : canLaunch
                ? 'bg-primary text-on-primary hover:brightness-110 active:scale-95 shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
          }`}
        >
          {launchOrg.isPending ? (
            <span className="flex items-center gap-sm justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              Iniciando...
            </span>
          ) : launched || isAlreadyActive ? (
            'Lançamento Concluído'
          ) : (
            'Lançar Portal do Ecossistema'
          )}
        </button>
        {!canLaunch && !isAlreadyActive && (
          <p className="text-label-sm text-on-surface-variant mt-md">
            Complete os dados da organização e crie pelo menos uma competição para lançar.
          </p>
        )}
      </div>

      <div className="flex justify-between mt-xl">
        <Link
          to={onboardingRoutes.competition}
          className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-title-md">Voltar</span>
        </Link>
        <Link
          to={ROUTES.DASHBOARD}
          className="border border-outline px-xl py-md rounded-lg font-title-md hover:bg-white/5 transition-all"
        >
          Finalizar
        </Link>
      </div>
    </OnboardingLayout>
  )
}
