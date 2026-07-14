import { useTranslation } from 'react-i18next'

interface Feature {
  icon: string
  image?: string
  colSpan?: number
}

const features: Feature[] = [
  {
    icon: 'trophy',
    colSpan: 2,
  },
  {
    icon: 'person_search',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDxJ-49uY7Tt8NJvkhsGjMKBWD-ZV_0cHtjS1-iyrZlI_Al0y7DS5kfbdF9P2TSScMWVUxTtolYB_GtTQ8-jmHu-6Tn1k1DZCxdZ0y_va3OZ8x1xw058MAdaHfMlZZExJ7CIduu8BYJoiKlJymCPDkTakNEwv8wP4q99RLgNxKQ08WcSZc9Zr2Nup4tXmHqCIWA41D_1rnBXcIPYHsu-qZAkA3zJOr6O43mhr1ISy6Uf4AxtQjx_nHGNcyShdUc3ce2WHws36dSI2s',
  },
  {
    icon: 'fitness_center',
  },
  {
    icon: 'campaign',
    colSpan: 2,
  },
]

interface FeaturesGridProps {
  onFeatureClick?: (feature: { icon: string; title: string; description: string }) => void
}

export function FeaturesGrid({ onFeatureClick }: FeaturesGridProps) {
  const { t } = useTranslation()
  const featureTexts = t('landing.features.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter">
      {/* Header */}
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">
          {t('landing.features.title')}
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          {t('landing.features.subtitle')}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg h-auto">
        {features.map((feature, idx) => {
          const text = featureTexts[idx]
          return (
            <div
              key={idx}
              className={`glass-panel rounded-xl p-lg flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer ${
                feature.colSpan === 2 ? 'md:col-span-2' : ''
              }`}
              onClick={() => onFeatureClick?.({ ...feature, ...text })}
            >
              {/* Content */}
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-md" aria-hidden="true">{feature.icon}</span>
                <h3 className="font-title-md text-2xl text-on-surface mb-sm">{text?.title}</h3>
                <p className="font-body-md text-on-surface-variant max-w-md">{text?.description}</p>
              </div>

              {/* Image or Mockup */}
              {feature.colSpan === 2 && feature.icon === 'trophy' && (
                <div className="mt-xl h-48 bg-surface-container-highest/40 rounded-lg border border-outline-variant overflow-hidden relative">
                  <div className="absolute inset-0 p-md">
                    <div className="space-y-xs">
                      <div className="flex justify-between items-center p-sm bg-surface-container-low rounded">
                        <span className="font-data-tabular">Petro Luanda vs Sagrada Esperança</span>
                        <span className="text-primary font-bold">2 - 1</span>
                      </div>
                      <div className="flex justify-between items-center p-sm bg-surface-container-low rounded opacity-60">
                        <span className="font-data-tabular">Primeiro de Agosto vs Bravos do Maquis</span>
                        <span className="text-primary font-bold">0 - 0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {feature.image && (
                <img
                  src={feature.image}
                  alt={text?.title ?? ''}
                  loading="lazy"
                  className="h-40 w-full object-cover rounded-lg border border-outline-variant mt-lg"
                />
              )}

              {feature.colSpan === 2 && feature.icon === 'campaign' && (
                <div className="mt-lg bg-surface-container-highest/40 rounded-lg border border-outline-variant flex items-center justify-center p-md">
                  <div className="w-full space-y-sm">
                    <div className="h-3 bg-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-primary/20 rounded w-4/5"></div>
                    <div className="h-3 bg-primary/20 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
