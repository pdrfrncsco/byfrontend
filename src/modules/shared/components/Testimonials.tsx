import { useTranslation } from 'react-i18next'

interface Testimonial {
  image?: string
  highlighted?: boolean
}

const testimonials: Testimonial[] = [{ highlighted: true }, {}]

export function Testimonials() {
  const { t } = useTranslation()
  const testimonialTexts = t('landing.testimonials.items', { returnObjects: true }) as Array<{
    quote: string
    author: string
    title: string
  }>

  return (
    <section className="py-xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Header */}
        <div className="text-center mb-xl">
          <h2 className="font-display-lg text-headline-lg text-on-surface uppercase mb-sm">
            {t('landing.testimonials.title')}
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            {t('landing.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {testimonials.map((testimonial, idx) => {
            const text = testimonialTexts[idx]
            return (
              <figure
                key={idx}
                className={`glass-panel rounded-xl p-lg border ${
                  testimonial.highlighted
                    ? 'border-primary/60 md:col-span-2 md:max-w-2xl md:mx-auto'
                    : 'border-outline-variant'
                }`}
              >
                {/* Quote */}
                <blockquote className="font-body-md text-on-surface mb-lg italic">
                  &ldquo;{text?.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <figcaption className="flex items-center gap-md">
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt=""
                      loading="lazy"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <cite className="font-title-md text-on-surface not-italic block">{text?.author}</cite>
                    <p className="font-body-md text-on-surface-variant text-sm">{text?.title}</p>
                  </div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
