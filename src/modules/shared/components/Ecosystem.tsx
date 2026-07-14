import { useTranslation } from 'react-i18next'

interface EcosystemItem {
  icon: string
}

const ecosystemItems: EcosystemItem[] = [
  { icon: 'groups' },
  { icon: 'sports_soccer' },
  { icon: 'person' },
]

export function Ecosystem() {
  const { t } = useTranslation()
  const ecoTexts = t('landing.ecosystem.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <section className="py-xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">
            {t('landing.ecosystem.title')}
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            {t('landing.ecosystem.subtitle')}
          </p>
        </div>

        {/* Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
          {ecosystemItems.map((item, idx) => {
            const text = ecoTexts[idx]
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl p-lg hover:border-primary/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-lg group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">{item.icon}</span>
                </div>
                <h3 className="font-title-md text-xl text-on-surface mb-sm">{text?.title}</h3>
                <p className="font-body-md text-on-surface-variant">{text?.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
