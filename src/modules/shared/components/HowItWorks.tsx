import { useTranslation } from 'react-i18next'

interface HowItWorksStep {
  number: number
}

const steps: HowItWorksStep[] = [{ number: 1 }, { number: 2 }, { number: 3 }]

export function HowItWorks() {
  const { t } = useTranslation()
  const stepTexts = t('landing.howItWorks.steps', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <section className="py-xl bg-surface-container-low overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">
            {t('landing.howItWorks.title')}
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row justify-between gap-xl relative">
          {/* Progress Line */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-[2px] bg-outline-variant -z-0"></div>

          {steps.map((step, idx) => {
            const text = stepTexts[idx]
            return (
              <div key={step.number} className="flex-1 z-10 group">
                <div
                  aria-hidden="true"
                  className="w-16 h-16 rounded-full bg-primary text-on-primary-fixed flex items-center justify-center font-display-lg text-2xl mb-lg group-hover:scale-110 transition-transform shadow-lg"
                >
                  {step.number}
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
