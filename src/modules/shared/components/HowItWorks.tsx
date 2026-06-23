interface HowItWorksStep {
  number: number
  title: string
  description: string
}

const steps: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Registo',
    description: 'Criação da conta institucional e verificação de credenciais pela federação local.',
  },
  {
    number: 2,
    title: 'Integração de Dados',
    description: 'Importação automatizada de histórico de atletas, contratos e registos de competições passadas.',
  },
  {
    number: 3,
    title: 'Gestão e Análise',
    description: 'Acesso total às ferramentas de análise preditiva e otimização de processos diários.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-xl bg-surface-container-low overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">Como Funciona</h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row justify-between gap-xl relative">
          {/* Progress Line */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-[2px] bg-outline-variant -z-0"></div>

          {steps.map(step => (
            <div key={step.number} className="flex-1 z-10 group">
              <div className="w-16 h-16 rounded-full bg-primary text-on-primary-fixed flex items-center justify-center font-display-lg text-2xl mb-lg group-hover:scale-110 transition-transform shadow-lg">
                {step.number}
              </div>
              <h4 className="font-title-md text-xl text-on-surface mb-sm">{step.title}</h4>
              <p className="font-body-md text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
