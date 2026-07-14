import { useTranslation } from 'react-i18next'

interface Stat {
  value: string
}

const stats: Stat[] = [{ value: '1,200+' }, { value: '45,000+' }, { value: '10+' }]

export function Statistics() {
  const { t } = useTranslation()
  const statTexts = t('landing.stats.items', { returnObjects: true }) as Array<{ label: string }>

  return (
    <section aria-labelledby="stats-title" className="py-20 relative">
      <h2 id="stats-title" className="sr-only">
        {t('landing.stats.heading', 'Impact in numbers')}
      </h2>
      <div className="max-w-container-max mx-auto px-gutter relative z-10">
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-xl text-center">
          {stats.map((stat, idx) => {
            const text = statTexts[idx]
            const labelId = `stat-label-${idx}`
            return (
              <div key={idx} className="flex flex-col items-center">
                <dt id={labelId} className="font-title-md text-on-surface-variant uppercase tracking-widest order-2">
                  {text?.label}
                </dt>
                <dd className="font-display-lg text-6xl text-primary mb-sm order-1" aria-labelledby={labelId}>
                  {stat.value}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
