import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Trophy, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  const year = new Date().getFullYear()
  const { t } = useTranslation()
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="border-t border-border bg-card/60 text-foreground">
      <div className="mx-auto max-w-7xl px-md py-xl md:px-xl">
        <div className="grid grid-cols-1 gap-xl md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="space-y-md lg:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary-fixed shadow-md">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-display-lg text-xl font-black tracking-wider text-foreground">
                BOLA<span className="text-primary">YETU</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Plataforma tecnológica de gestão desportiva, inteligência de jogos e acompanhamento de atletas para o futebol africano.
            </p>
            {/* Newsletter */}
            <div className="space-y-xs pt-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Subscrever Novidades</p>
              {subscribed ? (
                <div className="flex items-center gap-xs text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Obrigado! Ficará a par das atualizações.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-xs">
                  <Input
                    type="email"
                    placeholder="email.oficial@clube.co.ao"
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
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Produto</h4>
            <ul className="space-y-xs text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  Gestão de Torneios
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Ecosystem Col */}
          <div className="space-y-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Ecossistema</h4>
            <ul className="space-y-xs text-sm text-muted-foreground">
              <li>
                <Link to={ROUTES.PUBLIC_EXPLORE} className="hover:text-primary transition-colors">
                  Diretório Público
                </Link>
              </li>
              <li>
                <Link to={ROUTES.COMPETITIONS} className="hover:text-primary transition-colors">
                  Competições Ativas
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CLUBS} className="hover:text-primary transition-colors">
                  Clubes e Academias
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PLAYERS} className="hover:text-primary transition-colors">
                  Base de Atletas
                </Link>
              </li>
              <li>
                <Link to={ROUTES.NEWS} className="hover:text-primary transition-colors">
                  Notícias & Imprensa
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Col */}
          <div className="space-y-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal & Conformidade</h4>
            <ul className="space-y-xs text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Proteção de Dados (RGPD)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Regulamento de Transferências
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-xl flex flex-col items-center justify-between gap-md border-t border-border pt-md text-xs text-muted-foreground sm:flex-row">
          <p>© {year} BolaYetu Sports Tech. Todos os direitos reservados.</p>
          <div className="flex gap-md">
            <a href="#" className="hover:text-primary transition-colors">
              Estado dos Serviços
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Suporte Técnico
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
