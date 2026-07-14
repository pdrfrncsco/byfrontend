import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function FAQ() {
  const { t } = useTranslation()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const faqs = t('landing.faq.items', { returnObjects: true }) as Array<{
    question: string
    answer: string
  }>

  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter">
      {/* Header */}
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">
          {t('landing.faq.title')}
        </h2>
      </div>

      {/* FAQ Items */}
      <div className="max-w-3xl mx-auto space-y-md">
        {faqs.map((faq, idx) => {
          const isOpen = expandedIndex === idx
          const questionId = `faq-question-${idx}`
          const panelId = `faq-panel-${idx}`
          return (
            <div
              key={idx}
              className="glass-panel rounded-xl overflow-hidden border-outline-variant border transition-all hover:border-primary/40"
            >
              <button
                type="button"
                id={questionId}
                className="flex items-center justify-between p-lg w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setExpandedIndex(isOpen ? null : idx)}
              >
                <h3 className="font-title-md text-on-surface">{faq.question}</h3>
                <span
                  className={`material-symbols-outlined transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div id={panelId} role="region" aria-labelledby={questionId}>
                  <div className="px-lg pb-lg border-t border-outline-variant pt-lg">
                    <p className="font-body-md text-on-surface-variant">{faq.answer}</p>
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
