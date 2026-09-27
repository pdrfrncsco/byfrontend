import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const defaultFaqs = [
  {
    question: 'Como posso registar a minha federação, associação ou clube na BolaYetu?',
    answer:
      'Clique em "Criar Conta" ou no botão "Registar Organização Oficial". Preencha os dados institucionais da sua entidade (nome, tipo, país e província). A sua conta terá acesso imediato ao painel de administração de competições, plantéis e homologação.',
  },
  {
    question: 'Como posso filiar o meu clube a uma federação ou liga na plataforma?',
    answer:
      'Ao criar a conta de Clube, pode pesquisar no diretório oficial a federação ou associação da sua província e submeter o pedido de filiação. O responsável institucional receberá o pedido e homologará o clube.',
  },
  {
    question: 'A plataforma é adequada para ligas de futebol amador e torneios de formação?',
    answer:
      'Sim! A BolaYetu suporta desde campeonatos de escalões de formação (Sub-13 a Sub-20) e torneios comunitários até ligas nacionais seniores com pontos corridos, grupos e eliminatórias da Taça.',
  },
  {
    question: 'Como funciona a ficha digital e o acompanhamento de atletas?',
    answer:
      'Cada jogador possui uma ficha oficial única com fotos, biometria, posição, histórico de clubes, estatísticas e vídeos. Os dados ficam centralizados e podem ser consultados por olheiros e delegados.',
  },
  {
    question: 'Os dados dos jogos e classificações são atualizados em tempo real?',
    answer:
      'Sim. Durante as partidas, os delegados ou diretores de mesa registam golos, cartões e substituições na súmula eletrónica, atualizando instantaneamente o Centro de Jogos ao vivo e a tabela classificativa.',
  },
]

export function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <h2 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight">
          Perguntas Frequentes
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Tudo o que precisa de saber para digitalizar competições, clubes e atletas na BolaYetu.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {defaultFaqs.map((faq, idx) => {
          const isOpen = expandedIndex === idx
          const questionId = `faq-question-${idx}`
          const panelId = `faq-panel-${idx}`

          return (
            <div
              key={idx}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/90 transition-all duration-200 shadow-xs hover:border-primary/40 overflow-hidden"
            >
              <button
                type="button"
                id={questionId}
                className="flex items-center justify-between p-5 sm:p-6 w-full text-left font-bold text-base sm:text-lg text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setExpandedIndex(isOpen ? null : idx)}
              >
                <span className="pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={questionId}
                  className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 animate-in fade-in duration-200"
                >
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-4">
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
