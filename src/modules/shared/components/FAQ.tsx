import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, HelpCircle } from 'lucide-react'

const defaultFaqs = [
  {
    question: 'Como posso registar a minha organização ou clube no BolaYetu?',
    answer: 'Clique em "Criar Organização" no cabeçalho ou menu principal, preencha os dados institucionais e a sua conta passará a ter acesso imediato ao painel de administração de competições e plantéis.',
  },
  {
    question: 'A plataforma é adequada para ligas amadoras e torneios de formação?',
    answer: 'Sim! A BolaYetu suporta desde campeonatos de bairros e torneios de formação (Sub-13 a Sub-20) até ligas nacionais seniores com pontos corridos e eliminatórias.',
  },
  {
    question: 'Como funciona o cartão digital e a ficha de atleta?',
    answer: 'Cada jogador possui um perfil único com identificação biométrica, estatísticas de carreira e histórico de afiliações. Os cartões de jogador podem ser validados por olheiros e delegados de jogo através de QR Code.',
  },
  {
    question: 'Os dados das partidas são atualizados em tempo real?',
    answer: 'Sim. Durante os jogos, os delegados ou diretores de campo podem registar golos, cartões e substituições diretamente pelo telemóvel, atualizando instantaneamente a tabela de classificação pública.',
  },
  {
    question: 'Quais são os métodos de pagamento suportados para os planos pagos?',
    answer: 'Aceitamos pagamentos via Multicaixa Express, transferência bancária (IBAN) e cartões bancários internacionais.',
  },
]

export function FAQ() {
  const { t } = useTranslation()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const tResult = t('landing.faq.items', { returnObjects: true })
  const faqs = Array.isArray(tResult) && tResult.length > 0 ? tResult : defaultFaqs

  return (
    <section id="faq" className="py-24 max-w-4xl mx-auto px-md md:px-xl">
      {/* Header */}
      <div className="text-center mb-xl space-y-sm">
        {/* <div className="inline-flex items-center gap-xs rounded-full bg-primary/10 px-md py-xs text-xs font-bold text-primary">
          <HelpCircle className="h-3.5 w-3.5" /> Dúvidas Frequentes
        </div> */}
        <h2 className="font-display-lg text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Perguntas Frequentes
        </h2>
        <p className="text-muted-foreground text-base">
          Tudo o que precisa de saber para começar a usar a plataforma BolaYetu.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-md">
        {faqs.map((faq, idx) => {
          const isOpen = expandedIndex === idx
          const questionId = `faq-question-${idx}`
          const panelId = `faq-panel-${idx}`

          return (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card/80 transition-all duration-200 shadow-sm"
            >
              <button
                type="button"
                id={questionId}
                className="flex items-center justify-between p-md sm:p-lg w-full text-left font-bold text-base sm:text-lg text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setExpandedIndex(isOpen ? null : idx)}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div id={panelId} role="region" aria-labelledby={questionId} className="px-md sm:px-lg pb-md sm:pb-lg pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-md">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
