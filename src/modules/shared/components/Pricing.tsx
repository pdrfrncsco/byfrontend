import { useTranslation } from 'react-i18next'

interface PricingPlan {
  price: string
  highlighted?: boolean
}

const plans: PricingPlan[] = [
  { price: '0' },
  { price: '40.99€', highlighted: true },
  { price: 'Custom' },
]

export function Pricing() {
  const { t } = useTranslation()
  const planTexts = t('landing.pricing.plans', { returnObjects: true }) as Array<{
    name: string
    period: string
    features: string[]
  }>
  const ctaStart = t('landing.pricing.ctaStart')
  const ctaContact = t('landing.pricing.ctaContact')

  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter">
      {/* Header */}
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">
          {t('landing.pricing.title')}
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          {t('landing.pricing.subtitle')}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {plans.map((plan, idx) => {
          const text = planTexts[idx]
          return (
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
                <h3 className="font-title-md text-2xl text-on-surface mb-lg">{text?.name}</h3>

                {/* Price */}
                <div className="mb-lg">
                  <span className="font-display-lg text-4xl text-primary">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-on-surface-variant ml-sm">/{text?.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-sm">
                  {text?.features?.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5" aria-hidden="true">check</span>
                      <span className="font-body-md">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                className={`mt-lg w-full py-md px-lg font-bold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  plan.highlighted
                    ? 'bg-primary text-on-primary-fixed hover:bg-opacity-90'
                    : 'border border-outline-variant text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {idx === plans.length - 1 ? ctaContact : ctaStart}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
