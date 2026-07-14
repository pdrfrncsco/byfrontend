import { useTranslation } from 'react-i18next'

export function Footer() {
  const year = new Date().getFullYear()
  const { t } = useTranslation()

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-xl">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
          {/* Brand */}
          <div>
            <span className="font-display-lg text-headline-lg-mobile text-primary tracking-widest">BOLAYETU</span>
            <p className="font-body-md text-on-surface-variant mt-md">
              Ecossistema unificado para o futebol africano com tecnologia de elite.
            </p>
            <div className="flex gap-sm mt-lg">
              <a
                href="#"
                aria-label={t('footer.social.github', 'GitHub')}
                className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-sm"
              >
                <span className="material-symbols-outlined" aria-hidden="true">github</span>
              </a>
              <a
                href="#"
                aria-label={t('footer.social.twitter', 'Twitter')}
                className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-sm"
              >
                <span className="material-symbols-outlined" aria-hidden="true">twitter</span>
              </a>
              <a
                href="#"
                aria-label={t('footer.social.website', 'Website')}
                className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-sm"
              >
                <span className="material-symbols-outlined" aria-hidden="true">language</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-title-md text-on-surface mb-md">{t('footer.product')}</h4>
            <ul className="space-y-sm">
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.features')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.pricing')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.docs')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.roadmap')}
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-title-md text-on-surface mb-md">{t('footer.company')}</h4>
            <ul className="space-y-sm">
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.blog')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.careers')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-title-md text-on-surface mb-md">{t('footer.legal')}</h4>
            <ul className="space-y-sm">
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.cookies')}
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  {t('footer.security')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center">
          <p className="font-body-md text-on-surface-variant">© {year} BolaYetu. Todos os direitos reservados.</p>
          <div className="flex gap-md mt-md md:mt-0">
            <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
              {t('footer.status')}
            </a>
            <span className="text-outline-variant">•</span>
            <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
              {t('footer.support')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
