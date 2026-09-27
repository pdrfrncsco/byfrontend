import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts'
import { useRegisterOrganization } from '@/modules/auth/hooks'
import {
  registerOrganizationSchema,
  type RegisterOrganizationFormData,
} from '@/modules/auth/schemas'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import { PasswordInput } from '@/components/ui/password-input'
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  ShieldCheck,
  Trophy,
  Award,
  Globe,
} from 'lucide-react'

export function RegisterOrganizationPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterOrganization()

  useSeo({
    title: 'Registar Organização Oficial',
    description:
      'Registe a sua federação, associação ou liga na BolaYetu e comece a gerir o seu ecossistema desportivo.',
    path: '/register/organization',
  })

  const form = useForm<RegisterOrganizationFormData>({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
      organization_name: '',
      organization_type: 'federation',
      country: 'AO',
      city: '',
    },
  })

  const onSubmit = async (data: RegisterOrganizationFormData) => {
    const countryLabels: Record<string, string> = {
      AO: 'Angola',
      MZ: 'Moçambique',
      PT: 'Portugal',
      BR: 'Brasil',
      CV: 'Cabo Verde',
      GW: 'Guiné-Bissau',
      ST: 'São Tomé e Príncipe',
    }

    const result = await registerMutation.mutateAsync({
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined,
      organization_name: data.organization_name,
      organization_type: data.organization_type,
      country: countryLabels[data.country] || data.country,
      city: data.city || undefined,
    })

    if (result) {
      navigate(ROUTES.ONBOARDING)
    }
  }

  const inputClass =
    'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
  const labelClass = 'block font-title-md text-on-surface mb-1 text-xs font-semibold'

  return (
    <AuthLayout
      panelProps={{
        badge: 'Governança & Homologação Oficial',
        title: 'Digitalização Completa de Ligas, Associações e Federações',
        quote:
          'A BolaYetu permitiu estruturar todo o campeonato provincial com emissão eletrónica de licenças e súmulas em tempo real.',
        author: 'Dr. Manuel Gonçalves, Federação Provincial',
        stats: [
          {
            icon: Building2,
            value: '+50',
            label: 'Federações & Ligas',
            colorClass: 'text-primary',
          },
          {
            icon: Award,
            value: '100%',
            label: 'Conformidade Regulamentar',
            colorClass: 'text-emerald-500',
          },
        ],
      }}
    >
      <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-outline-variant shadow-xl">
        {/* Top Back Nav */}
        <Link
          to={ROUTES.REGISTER}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Alterar tipo de perfil
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Registo Institucional
            </span>
          </div>
          <h1 className="font-display-lg text-2xl font-bold text-on-surface">
            Registar Organização
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Crie a sua conta de administrador e prepare o lançamento do seu portal desportivo.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Organization Name */}
          <div>
            <label className={labelClass} htmlFor="org_name">
              Nome da Organização / Federação / Liga
            </label>
            <input
              id="org_name"
              className={inputClass}
              placeholder="Ex: Federação Angolana de Futebol ou Liga Provincial"
              autoFocus
              {...form.register('organization_name')}
            />
            {form.formState.errors.organization_name && (
              <p className="text-xs text-error mt-1">
                {form.formState.errors.organization_name.message}
              </p>
            )}
          </div>

          {/* Type and Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="org_type">
                Tipo de Entidade
              </label>
              <select id="org_type" className={inputClass} {...form.register('organization_type')}>
                <option value="federation">Federação Nacional</option>
                <option value="association">Associação Provincial</option>
                <option value="league">Liga / Torneio</option>
                <option value="organizer">Organizador Privado</option>
                <option value="academy">Academia / Centro Formação</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="org_country">
                País
              </label>
              <select id="org_country" className={inputClass} {...form.register('country')}>
                <option value="AO">🇦🇴 Angola</option>
                <option value="MZ">🇲🇿 Moçambique</option>
                <option value="PT">🇵🇹 Portugal</option>
                <option value="BR">🇧🇷 Brasil</option>
                <option value="CV">🇨🇻 Cabo Verde</option>
                <option value="GW">🇬🇼 Guiné-Bissau</option>
                <option value="ST">🇸🇹 São Tomé e Príncipe</option>
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <label className={labelClass} htmlFor="org_city">
              Cidade / Província
            </label>
            <input
              id="org_city"
              placeholder="Ex: Luanda, Benguela, Maputo..."
              className={inputClass}
              {...form.register('city')}
            />
          </div>

          {/* Administrator Name */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className={labelClass} htmlFor="adm_first_name">
                Nome do Responsável
              </label>
              <input
                id="adm_first_name"
                placeholder="Ex: Manuel"
                className={inputClass}
                {...form.register('first_name')}
              />
              {form.formState.errors.first_name && (
                <p className="text-xs text-error mt-1">
                  {form.formState.errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="adm_last_name">
                Apelido
              </label>
              <input
                id="adm_last_name"
                placeholder="Ex: Neto"
                className={inputClass}
                {...form.register('last_name')}
              />
              {form.formState.errors.last_name && (
                <p className="text-xs text-error mt-1">
                  {form.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass} htmlFor="org_email">
              Email Institucional
            </label>
            <input
              id="org_email"
              type="email"
              placeholder="admin@federacao.ao"
              className={inputClass}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-error mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass} htmlFor="org_phone">
              Telemóvel de Contacto (Opcional)
            </label>
            <input
              id="org_phone"
              type="tel"
              placeholder="+244 923 000 000"
              className={inputClass}
              {...form.register('phone')}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelClass} htmlFor="org_password">
              Palavra-passe do Administrador
            </label>
            <PasswordInput
              id="org_password"
              placeholder="••••••••"
              showStrengthMeter
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClass} htmlFor="org_password_confirm">
              Confirmar Palavra-passe
            </label>
            <PasswordInput
              id="org_password_confirm"
              placeholder="••••••••"
              error={form.formState.errors.password_confirm?.message}
              {...form.register('password_confirm')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-lg py-3 font-bold text-on-primary-fixed transition-all hover:scale-[1.01] active:scale-[0.99] text-sm disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
          >
            {registerMutation.isPending ? (
              'A criar organização...'
            ) : (
              <>
                <span>Registar Organização & Iniciar Setup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-outline-variant/60 text-center text-xs text-on-surface-variant">
          Já tem conta institucional?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline">
            Fazer Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
