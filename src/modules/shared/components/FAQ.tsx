import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Como começo a usar o BolaYetu?',
    answer:
      'É simples! Registe-se na nossa plataforma, complete a verificação institucional e aceda ao dashboard. Todo o processo leva menos de 24 horas.',
  },
  {
    question: 'O BolaYetu suporta diferentes línguas?',
    answer:
      'Sim, a plataforma está disponível em português, inglês, francês e espanhol, com suporte a mais idiomas em desenvolvimento.',
  },
  {
    question: 'Posso integrar o BolaYetu com meus sistemas existentes?',
    answer:
      'Absolutamente! Oferecemos APIs robustas para integração com sistemas legados. Nosso time técnico pode auxiliar na configuração.',
  },
  {
    question: 'Qual é o período de suporte e SLA?',
    answer:
      'Clientes Premium e Enterprise têm suporte 24/7 com tempo de resposta garantido. Planos Básicos têm suporte em horário comercial.',
  },
]

export function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section className="py-xl max-w-container-max mx-auto px-gutter">
      {/* Header */}
      <div className="text-center mb-xl">
        <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">Perguntas Frequentes</h2>
      </div>

      {/* FAQ Items */}
      <div className="max-w-3xl mx-auto space-y-md">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-xl overflow-hidden border-outline-variant border cursor-pointer transition-all hover:border-primary/40"
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
          >
            {/* Question */}
            <div className="flex items-center justify-between p-lg">
              <h3 className="font-title-md text-on-surface">{faq.question}</h3>
              <span className={`material-symbols-outlined transition-transform ${expandedIndex === idx ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </div>

            {/* Answer */}
            {expandedIndex === idx && (
              <div className="px-lg pb-lg border-t border-outline-variant pt-lg">
                <p className="font-body-md text-on-surface-variant">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
