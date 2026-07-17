import { Link } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import { ArrowRight, Building2, Shield, Star, Users } from 'lucide-react'
import { sharedRoutes } from '@/modules/shared/routes'

const cardClass =
  'group flex h-full flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-lg text-left transition-transform hover:-translate-y-0.5 hover:border-primary'

const cardCopy: Array<{
  title: string
  description: string
  href?: string
  icon: typeof Building2
  badge?: string
}> = [
  {
    title: 'Jogador',
    description: 'Conta individual para gerir o seu perfil, visibilidade pública e pedido de vínculo.',
    href: sharedRoutes.registerPlayer,
    icon: Users,
  },
  {
    title: 'Clube',
    description: 'Conta para gerir o perfil do clube, ligação institucional e presença pública.',
    href: sharedRoutes.registerClub,
    icon: Shield,
  },
  {
    title: 'Fan',
    description: 'Perfil para acompanhar equipas, competições e atividades da comunidade.',
    href: sharedRoutes.registerFan,
    icon: Star,
  },
  {
    title: 'Organização',
    description: 'Registo institucional para federações, ligas, associações e academias.',
    href: ROUTES.REGISTER_ORGANIZATION,
    icon: Building2,
  },
]

export function RegisterPage() {
  useSeo({
    title: 'Criar conta',
    description: 'Escolha o tipo de registo que melhor corresponde ao seu perfil na Bolayetu.',
    path: '/register',
  })

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl">
        <div className="mb-lg max-w-2xl">
          <h1 className="font-display-lg text-headline-lg text-on-surface">Criar conta</h1>
          <p className="mt-sm text-sm text-on-surface-variant">
            Selecione o seu perfil para iniciar o registo correto. Cada tipo de conta segue um fluxo
            próprio de onboarding e permissões.
          </p>
        </div>

        <div className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
          {cardCopy.map((card) => {
            const Icon = card.icon
            const content = (
              <div className={cardClass}>
                <div>
                  <div className="mb-md flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-on-surface">{card.title}</h2>
                  <p className="mt-xs text-sm text-on-surface-variant">{card.description}</p>
                </div>
                <div className="mt-lg flex items-center gap-2 text-sm font-medium text-primary">
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            )

            return card.href ? (
              <Link key={card.title} to={card.href} className="block h-full">
                {content}
              </Link>
            ) : (
              <div key={card.title} className="block h-full">
                {content}
              </div>
            )
          })}

          <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-lg">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface">Scouting</h2>
            <p className="mt-xs text-sm text-on-surface-variant">
              Fluxo próprio em preparação. O registo será separado quando o módulo estiver ativo.
            </p>
            <p className="mt-lg text-sm font-medium text-on-surface-variant">Em breve</p>
          </div>
        </div>

        <div className="mt-lg flex flex-wrap items-center justify-between gap-sm text-sm text-on-surface-variant">
          <p>Já tem conta?</p>
          <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 font-medium text-primary">
            Fazer login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
