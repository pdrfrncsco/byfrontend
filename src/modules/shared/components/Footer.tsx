export function Footer() {
  const year = new Date().getFullYear()

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
              <a href="#" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                github
              </a>
              <a href="#" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                twitter
              </a>
              <a href="#" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                language
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-title-md text-on-surface mb-md">Produto</h4>
            <ul className="space-y-sm">
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-title-md text-on-surface mb-md">Empresa</h4>
            <ul className="space-y-sm">
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Contacte-nos
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Carreiras
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-title-md text-on-surface mb-md">Legal</h4>
            <ul className="space-y-sm">
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
                  Segurança
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
              Status
            </a>
            <span className="text-outline-variant">•</span>
            <a href="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
