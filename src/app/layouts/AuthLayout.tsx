import { ReactNode } from 'react'
import { PublicHeader } from '@/modules/shared/components'
import { Trophy, ShieldCheck, Flame, Star } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <PublicHeader variant="minimal" />

      <main className="flex-1 pt-16 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        {/* Left Side: Form Container */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-md sm:p-xl lg:p-2xl">
          <div className="w-full max-w-md space-y-md">
            {children}
          </div>
        </div>

        {/* Right Side: Editorial Sports Panel (Visible on lg+) */}
        <div className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-card via-muted/40 to-background border-l border-border p-2xl flex-col justify-between overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary-fixed shadow-md">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="font-display-lg text-xl font-black tracking-wider">
              BOLA<span className="text-primary">YETU</span>
            </span>
          </div>

          {/* Editorial Content & Testimonial */}
          <div className="relative z-10 space-y-lg max-w-lg">
            <div className="inline-flex items-center gap-xs rounded-full border border-primary/30 bg-primary/10 px-md py-xs text-xs font-bold text-primary">
              <Star className="h-3.5 w-3.5 fill-primary" /> Escolha de +50 Ligas e Federações
            </div>

            <h2 className="font-display-lg text-4xl font-black tracking-tight leading-tight">
              A Plataforma Digital de Gestão Desportiva de Elite
            </h2>

            <blockquote className="border-l-2 border-primary pl-md space-y-xs">
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                "A BolaYetu transformou a forma como gerimos o nosso campeonato regional. O registo de atletas e súmulas ao vivo agilizaram todo o nosso trabalho administrativo."
              </p>
              <footer className="text-xs font-bold text-foreground">
                — Manuel Neto, Diretor de Competições
              </footer>
            </blockquote>
          </div>

          {/* Bottom Metrics Bar */}
          <div className="relative z-10 grid grid-cols-2 gap-md pt-lg border-t border-border/60">
            <div className="flex items-center gap-sm">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <div>
                <div className="font-bold text-sm">+10.000</div>
                <div className="text-xs text-muted-foreground">Atletas Registados</div>
              </div>
            </div>

            <div className="flex items-center gap-sm">
              <Flame className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-sm">+500</div>
                <div className="text-xs text-muted-foreground">Jogos Realizados</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
