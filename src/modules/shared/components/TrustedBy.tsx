import { useTranslation } from 'react-i18next'

interface TrustedByProps {
  logos?: Array<{
    url: string
    alt: string
  }>
}

export function TrustedBy({ logos }: TrustedByProps) {
  const { t } = useTranslation()

  const defaultLogos = [
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4a7NvS7_sPw37wKTSIce416QogfebaIR6O3vwJMlTNobYsasXCRClsIryv7oAaQJyXQBcOoL1Za45Z7IR2RR0-UPLEo-xtHnmyqQhSw55Qpd0cqUtOMQaJJ-FGjaQzWNFxe_LURiHMHHZ4voaNWV4QNIIDq9aTN2IIUXhKPpvDqTOQJfEe_N34zJeDcYZsQnMK7DP7t9dAdPlkh4qgOzIb6oFO-TE7r4OA6DhUxn2D-TY0O3pqT0idtezDLJDqyRV2r0tkTPJCR8',
      alt: 'Federação Angolana de Futebol',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6ihIpu2eJQJ115AZYWtkldGU5ZkM30Ile4P-rmCV_HNgt1BLhUIF637uBgj7YDXjgJ7ex5eUWKZNNX1UKa3Jd76uvDaRJ21ldugzwC1WSQkoAhprnXDezBQbc_-IO2eGahZShVblWnujF9TE6XYmZ-XBw080nTcARspl9na9P8AuHIh-uUA7Zkbs3CL-fJ5BGoX4SKMiWaSTiZlG_nIolmos6A4pJ8wCt_ZTmuIdN_ZKFcYO4UB6MtWM2xOZ00YZchQjjP3-V0sY',
      alt: 'Liga Angolana de Futebol Profissional',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_K9yANI2-9it0d0X3DNxfOuXTwFOoSD9oByXnQsSNrnN_ZO-njNzNW1prjArappTWtyJ7joN1UQ-amKk9uoS2M60QGcEJWSQZiUtdEfxqSAcAJymQmeaolA43BdjcKqHXwRaTyvPo52OeOCmqd7bJfGA2fto4gl1p-qcelEDMMofGfWALh_Euz5c9Ax0xiOA4yeVHsU4DWZoFBBR5OsAJsvDmBowBXVwtNC5Ixbb8Xwh20PGMjcb30RrCizS-buUFJKaPTq882-8',
      alt: 'Competição Africana de Clubes',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf-KvjbqFsQsMdBTUNqNhcYO0Qwukkzchp91W2O-pdHD2xSpQobN7-Q1YV-ssYNQWtUZ7HQyVxBERjRiVGOHK2r8hbHBo8GNjR6vK2cEtfOPJx7gR3Idn0-a2lfQFe0LK0eyq-5FNzCdsg7I8QefuwWFsgkEefU3uRshE3lCcbl6pbpCh_9VGX886mHTp0JpWxtNl4Cf1MG7o-6tlp3f66buZXUM4E8-rx_CR_-nnf31C3iRge7KZqVx6LBaNcVJ5qTZ9H2QlaCAA',
      alt: 'Academia de Futebol de Elite',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqw8fkChanRidWKonvkNcu-UxCONgUd5BXGKx7t_d3JyKtJn1qqTdgvC6HSOIVU6CBJPa9Zap1L9dmW6KV_ZyxDV5AlFxKKy0yL7W9Wq6ikUkzNUVmFwcf4FoN3n4_bYvrVWa-PH_RP0DZR3dZTiKD2PkBgR_6R2TeTuT3Nb3HV_08aSIFpRrHPWWazNVPAw5gxQ5k7AGkJPRIPrcclyOTINBg7iLIoC7pwwkS_cdEGpqosoaZK5CEJT_pYzMFW6E459UGfCy_Mfo',
      alt: 'Agência Continental Africana de Desporto',
    },
  ]

  const displayLogos = logos || defaultLogos

  return (
    <section className="py-xl bg-surface-container-low border-y border-outline-variant">
      <div className="max-w-container-max mx-auto px-gutter text-center">
        <h2 className="font-label-sm text-label-sm text-on-surface-variant mb-lg uppercase tracking-widest">
          {t('landing.trustedBy.label')}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {displayLogos.map((logo, idx) => (
            <img
              key={idx}
              className="h-12 md:h-16 w-auto object-contain"
              src={logo.url}
              alt={logo.alt}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
