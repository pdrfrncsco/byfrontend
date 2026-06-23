interface Testimonial {
  quote: string
  author: string
  title: string
  image?: string
  highlighted?: boolean
}

const testimonials: Testimonial[] = [
  {
    quote:
      'O BolaYetu revolucionou a forma como gerimos nossos atletas e dados. A plataforma é intuitiva e os resultados são mensuráveis. Recomendo fortemente.',
    author: 'António Silva',
    title: 'Director Executivo, Petro Luanda',
    highlighted: true,
  },
  {
    quote:
      'A análise de performance com IA nos ajudou a identificar novos talentos que antes passavam despercebidos. Já aumentamos nosso scouting em 300%.',
    author: 'Dr. Manuel Gonçalves',
    title: 'Head Scout, Girabola Analytics',
  },
]

export function Testimonials() {
  return (
    <section className="py-xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">Vozes do Campo</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Veja como líderes do futebol africano estão transformando suas organizações.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`glass-panel rounded-xl p-lg border ${
                testimonial.highlighted ? 'border-primary/60 md:col-span-2 md:max-w-2xl md:mx-auto' : 'border-outline-variant'
              }`}
            >
              {/* Quote */}
              <p className="font-body-md text-on-surface mb-lg italic">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-md">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-title-md text-on-surface">{testimonial.author}</p>
                  <p className="font-body-md text-on-surface-variant text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
