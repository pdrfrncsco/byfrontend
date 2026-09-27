import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Trophy, Send, CheckCircle2, Shield, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const handleAnchorClick = (anchor: string) => {
    if (pathname === '/') {
      const el = document.querySelector(anchor)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/${anchor}`)
    }
  }

  return (
    <footer className="border-t border-border bg-card/60 text-foreground">
      <div className="mx-auto max-w-7xl px-md py-xl md:px-xl">
        <div className="grid grid-cols-1 gap-xl md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="space-y-md lg:col-span-2">
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary-fixed shadow-md">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-display-lg text-xl font-black tracking-wider text-foreground">
                BOLA<span className="text-primary">YETU</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Plataforma digital unificada de gestão desportiva, súmulas eletrónicas e acompanhamento
              de atletas para o futebol africano.
            </p>

            {/* Newsletter */}
            <div className="space-y-xs pt-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Fique a par das Novidades
              </p>
              {subscribed ? (
                <div className="flex items-center gap-xs text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Obrigado! O seu email foi registado.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-xs">
                  <Input
                    type="email"
                    placeholder="seu.email@dominio.ao"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-9 px-md">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Plataforma</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('#features')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Centro de Jogos & Súmulas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('#how-it-works')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Como Funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('#ecosystem')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Ecossistema Integrado
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('#faq')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Ecosystem Col */}
          <div className="space-y-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Ecossistema</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to={ROUTES.PUBLIC_EXPLORE} className="hover:text-primary transition-colors">
                  Diretório Público
                </Link>
              </li>
              <li>
                <Link to={ROUTES.COMPETITIONS} className="hover:text-primary transition-colors">
                  Competições & Ligas
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CLUBS} className="hover:text-primary transition-colors">
                  Clubes & Academias
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PLAYERS} className="hover:text-primary transition-colors">
                  Base de Atletas
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ORGANIZATIONS} className="hover:text-primary transition-colors">
                  Federações & Associações
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Registration Col */}
          <div className="space-y-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Acesso Rápido</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-primary transition-colors">
                  Iniciar Sessão
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-primary transition-colors">
                  Criar Conta
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER_ORGANIZATION} className="hover:text-primary transition-colors font-medium text-primary">
                  Registo de Organização
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER_PLAYER} className="hover:text-primary transition-colors">
                  Registo de Atleta
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER_CLUB} className="hover:text-primary transition-colors">
                  Registo de Clube
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-xl flex flex-col items-center justify-between gap-md border-t border-border pt-md text-xs text-muted-foreground sm:flex-row">
          <p>© {year} BolaYetu Sports Tech. Todos os direitos reservados.</p>
          <div className="flex items-center gap-md">
            <span>Plataforma Digital de Futebol</span>
            <span>•</span>
            <Link to={ROUTES.REGISTER} className="hover:text-primary transition-colors font-semibold">
              Junte-se à BolaYetu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
