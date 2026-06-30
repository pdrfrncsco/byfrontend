import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, ListOrdered, ArrowLeft, ArrowRight } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import {
  useCompetitions,
  useCreateCompetition,
  useUpdateCompetition,
} from '@/modules/competitions'
import type { CompetitionType } from '@/modules/competitions'

const TYPE_LABELS: Record<CompetitionType, string> = {
  league: 'Sistema de Liga',
  tournament: 'Sistema de Torneio',
  cup: 'Sistema de Taça',
}

const TYPE_DESCRIPTIONS: Record<CompetitionType, string> = {
  league: 'Pontos corridos, ida e volta',
  tournament: 'Grupos e eliminatórias',
  cup: 'Eliminatória direta',
}

function buildSeasonOptions(): string[] {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const seasons: string[] = []
  for (let i = -1; i <= 2; i++) {
    const y = startYear + i
    seasons.push(`${y}/${String(y + 1).slice(-2)}`)
  }
  return seasons
}

export default function CompetitionStep() {
  const { data: competitions, isLoading } = useCompetitions()
  const createCompetition = useCreateCompetition()
  const updateCompetition = useUpdateCompetition()

  const seasonOptions = useMemo(() => buildSeasonOptions(), [])
  const defaultSeason = seasonOptions[1] ?? seasonOptions[0] ?? '2025/26'

  const [competitionId, setCompetitionId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    competition_type: 'league' as CompetitionType,
    season: defaultSeason,
  })
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const saveTimeout = useRef<number | null>(null)

  useEffect(() => {
    if (!competitions || initialized) return
    const draft = competitions.find(c => c.status === 'draft') ?? competitions[0]
    if (draft) {
      setCompetitionId(draft.id)
      setForm({
        name: draft.name,
        competition_type: draft.competition_type,
        season: draft.season,
      })
    }
    setInitialized(true)
  }, [competitions, initialized])

  useEffect(() => {
    if (!initialized) return
    if (!form.name.trim()) return

    if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    saveTimeout.current = window.setTimeout(async () => {
      setSaving(true)
      try {
        const payload = {
          name: form.name.trim(),
          competition_type: form.competition_type,
          season: form.season,
          status: 'draft' as const,
        }

        if (competitionId) {
          await updateCompetition.mutateAsync({ id: competitionId, data: payload })
        } else {
          const created = await createCompetition.mutateAsync(payload)
          setCompetitionId(created.id)
        }
      } catch (e) {
        console.error('Competition autosave failed', e)
      } finally {
        setSaving(false)
      }
    }, 800)

    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, initialized])

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const previewTitle = form.name.trim() || 'Configura para Vencer'
  const typeLabel = TYPE_LABELS[form.competition_type]
  const typeDescription = TYPE_DESCRIPTIONS[form.competition_type]

  if (isLoading) {
    return (
      <OnboardingLayout step={3}>
        <div>Carregando...</div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout step={3}>
      <div className="mb-lg">
        <h2 className="font-display-lg text-display-lg text-primary mb-xs">Configuração de Competição</h2>
        <p className="text-on-surface-variant max-w-2xl">
          Defina os parâmetros técnicos da sua competição. Esta estrutura será a base para a gestão de resultados, estatísticas e calendários automáticos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-7">
          <section className="glass-card p-lg rounded-xl">
            <h3 className="font-title-md text-title-md text-on-surface mb-lg flex items-center gap-sm">
              <Trophy className="w-5 h-5 text-primary" />
              Criar Primeira Competição
            </h3>

            <form className="space-y-lg" onSubmit={e => e.preventDefault()}>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">
                  Nome da Competição
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Ex: Liga Nacional de Elite"
                  className="form-inset-input rounded-lg px-md py-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">
                    Tipo de Competição
                  </label>
                  <select
                    name="competition_type"
                    value={form.competition_type}
                    onChange={onChange}
                    className="form-inset-input rounded-lg px-md py-sm w-full"
                  >
                    <option value="league">Liga</option>
                    <option value="tournament">Torneio</option>
                    <option value="cup">Taça</option>
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">
                    Época
                  </label>
                  <select
                    name="season"
                    value={form.season}
                    onChange={onChange}
                    className="form-inset-input rounded-lg px-md py-sm w-full"
                  >
                    {seasonOptions.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-md flex items-center gap-md">
                <Link
                  to="/onboarding/branding"
                  className="flex-1 px-lg py-md border border-outline text-on-surface font-title-md hover:bg-white/5 transition-all rounded-lg flex items-center justify-center gap-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
                <Link
                  to="/onboarding/review"
                  className={`flex-1 px-lg py-md font-title-md transition-all rounded-lg flex items-center justify-center gap-sm ${
                    form.name.trim()
                      ? 'bg-primary text-on-primary hover:brightness-110'
                      : 'bg-surface-container-high text-on-surface-variant pointer-events-none opacity-60'
                  }`}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-right">
                <span className="text-label-sm text-on-surface-variant">
                  {saving ? 'A gravar...' : competitionId ? 'Guardado' : 'Preencha o nome para guardar'}
                </span>
              </div>
            </form>
          </section>
        </div>

        <aside className="lg:col-span-5 space-y-md">
          <div className="glass-card p-md rounded-xl border border-primary/20">
            <h4 className="font-label-sm text-primary uppercase mb-md">Visualização de Estrutura</h4>

            <div className="space-y-sm">
              <div className="flex items-center gap-md">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center text-primary">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 h-[2px] bg-white/10" />
                <div className="w-24 p-xs bg-surface-container-lowest border border-white/5 rounded text-center">
                  <span className="font-data-tabular text-label-sm">Equipas</span>
                </div>
              </div>

              <div className="ml-4 border-l-2 border-white/5 pl-md py-xs space-y-sm">
                <div className="flex items-center gap-sm p-sm bg-primary/5 rounded border border-primary/10">
                  <ListOrdered className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="font-label-sm text-primary">{typeLabel}</div>
                    <div className="text-[10px] text-on-surface-variant">{typeDescription}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div className="p-xs bg-surface-container-high rounded border border-white/5 flex flex-col items-center justify-center">
                    <span className="font-data-tabular text-primary">
                      {form.competition_type === 'league' ? '20' : form.competition_type === 'tournament' ? '16' : '32'}
                    </span>
                    <span className="text-[9px] uppercase text-on-surface-variant">Clubes</span>
                  </div>
                  <div className="p-xs bg-surface-container-high rounded border border-white/5 flex flex-col items-center justify-center">
                    <span className="font-data-tabular text-primary">
                      {form.competition_type === 'league' ? '380' : form.competition_type === 'tournament' ? '48' : '31'}
                    </span>
                    <span className="text-[9px] uppercase text-on-surface-variant">Jogos</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-md">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary-fixed-dim">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-1 h-[2px] bg-primary/20" />
                <div className="w-24 p-xs bg-primary-container/20 border border-primary/20 rounded text-center">
                  <span className="font-data-tabular text-label-sm text-primary">Troféu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-md rounded-xl border border-white/5">
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-tight mb-xs">
              {previewTitle}
            </div>
            <div className="text-on-surface-variant text-label-sm">
              {form.season} · {TYPE_LABELS[form.competition_type].replace('Sistema de ', '')}
            </div>
            <p className="text-on-surface-variant text-label-sm mt-sm">
              Dados precisos geram performance de elite.
            </p>
          </div>
        </aside>
      </div>
    </OnboardingLayout>
  )
}
