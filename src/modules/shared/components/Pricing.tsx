import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pricing() {
  const { t } = useTranslation()
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Gratuito / Inicial',
      priceMonthly: '0 Kz',
      priceAnnual: '0 Kz',
      period: 'para sempre',
      description: 'Ideal para pequenos clubes locais e início de atividades.',
      features: [
        'Até 30 atletas registados',
        'Inscrição em 1 competição ativa',
        'Ficha básica de jogador',
        'Suporte por comunidade',
      ],
      highlighted: false,
      ctaText: 'Começar Grátis',
      ctaHref: ROUTES.REGISTER_ORGANIZATION,
    },
    {
      name: 'Clube & Associação Pro',
      priceMonthly: '45.000 Kz',
      priceAnnual: '36.000 Kz',
      period: 'mês (faturado anualmente)',
      description: 'Perfeito para clubes profissionais e associações regionais.',
      features: [
        'Atletas ilimitados',
        'Competições e jornadas ilimitadas',
        'Relatórios biométricos e de olheirismo',
        'Gestão de súmulas eletrónicas ao vivo',
        'Gestão de contratos e transferências',
        'Suporte prioritário 24/7',
      ],
      highlighted: true,
      badge: 'Mais Popular',
      ctaText: 'Criar Organização Pro',
      ctaHref: ROUTES.REGISTER_ORGANIZATION,
    },
    {
      name: 'Federação / Enterprise',
      priceMonthly: 'Sob Consulta',
      priceAnnual: 'Sob Consulta',
      period: 'projeto personalizado',
      description: 'Para Federações Nacionais e Ligas Profissionais de grande porte.',
      features: [
        'Multi-tenant com instâncias dedicadas',
        'Integração via API com a FIFA / CAF',
        'Emissão automatizada de licenças federativas',
        'Módulo de inteligência estatística avançada',
        'Gerente de conta dedicado e formação local',
      ],
      highlighted: false,
      ctaText: 'Falar com Consultor',
      ctaHref: ROUTES.REGISTER_ORGANIZATION,
    },
  ]

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-md md:px-xl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-lg space-y-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Preçário Transparente</span>
        <h2 className="font-display-lg text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Planos ajustados ao tamanho do seu projeto
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Escolha o plano ideal para a sua organização e escale a gestão do seu futebol sem complicações.
        </p>
      </div>

      {/* Billing Switch */}
      <div className="flex items-center justify-center gap-sm mb-xl">
        <span className={`text-sm font-semibold ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Faturação Mensal
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow-lg ring-0 transition duration-200 ease-in-out ${
              isAnnual ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-xs">
          <span className={`text-sm font-semibold ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Faturação Anual
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-xs py-0.5 text-[11px] font-extrabold text-emerald-500">
            <Sparkles className="h-3 w-3" /> 20% OFF
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-2xl p-lg flex flex-col justify-between transition-all duration-300 ${
              plan.highlighted
                ? 'border-2 border-primary bg-card shadow-xl shadow-primary/10 md:-translate-y-2'
                : 'border border-border/80 bg-card/60 hover:border-border'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-md py-0.5 text-xs font-bold text-on-primary-fixed shadow-sm">
                {plan.badge}
              </div>
            )}

            <div className="space-y-md">
              <div>
                <h3 className="font-bold text-xl text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-xs">{plan.description}</p>
              </div>

              <div className="py-xs">
                <span className="font-display-lg text-4xl font-black text-primary">
                  {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                <span className="text-xs text-muted-foreground ml-xs">/{plan.period}</span>
              </div>

              <ul className="space-y-sm pt-xs border-t border-border/60">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-xs text-xs text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-lg">
              <Button
                asChild
                variant={plan.highlighted ? 'primary' : 'outline'}
                className="w-full font-bold h-11"
              >
                <Link to={plan.ctaHref}>{plan.ctaText}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
