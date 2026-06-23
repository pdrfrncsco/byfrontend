interface PricingPlan {
  name: string
  price: string
  period: string
  features: string[]
  highlighted?: boolean
}

const plans: PricingPlan[] = [
  {
    name: 'Básico',
    price: '0',
    period: 'para sempre',
    features: [
      'Até 20 atletas',
      'Relatórios básicos',
      'Suporte comunitário',
      'Acesso limitado a scouting',
    ],
  },
  {
    name: 'Professional',
    price: '40.99€',
    period: 'por mês',
    features: [
      'Atletas ilimitados',
      'Análise avançada',
      'Suporte prioritário',
      'Scouting com IA',
      'API access',
      'Relatórios customizados',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'negociável',
    features: [
      'Tudo do Professional',
      'Integração customizada',
      'Gestor de conta dedicado',
      'SLA garantido',
      'Treinamento on-site',
      'Infraestrutura privada',
    ],
  },
]

export function Pricing() {
  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter">
      {/* Header */}
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">Planos de Subscrição</h2>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          Escolha o plano perfeito para sua organização.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`glass-panel rounded-xl p-lg flex flex-col justify-between ${
              plan.highlighted
                ? 'border-primary/60 border-2 ring-1 ring-primary/20 md:scale-105'
                : 'border-outline-variant'
            } transition-transform hover:-translate-y-1`}
          >
            {/* Plan Name */}
            <div>
              <h3 className="font-title-md text-2xl text-on-surface mb-lg">{plan.name}</h3>

              {/* Price */}
              <div className="mb-lg">
                <span className="font-display-lg text-4xl text-primary">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-on-surface-variant ml-sm">/{plan.period}</span>}
              </div>

              {/* Features */}
              <ul className="space-y-sm">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                    <span className="font-body-md">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              className={`mt-lg w-full py-md px-lg font-bold rounded-lg transition-all ${
                plan.highlighted
                  ? 'bg-primary text-on-primary-fixed hover:bg-opacity-90'
                  : 'border border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {plan.name === 'Enterprise' ? 'Contactar Vendas' : 'Começar Agora'}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
