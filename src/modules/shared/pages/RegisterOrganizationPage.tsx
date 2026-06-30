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

const inputClass =
  'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
const labelClass = 'block font-title-md text-on-surface mb-sm text-xs'

export function RegisterOrganizationPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterOrganization()

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

  return (
    <AuthLayout>
      <div className="glass-panel rounded-xl p-xl max-w-lg w-full border border-outline-variant">
        <h1 className="font-display-lg text-headline-lg text-on-surface mb-xs text-center">
          Registar Organização
        </h1>
        <p className="text-on-surface-variant text-sm text-center mb-lg">
          Crie a sua conta de administrador e inicie o setup do ecossistema digital.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-md">
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className={labelClass}>Nome</label>
              <input className={inputClass} {...form.register('first_name')} />
              {form.formState.errors.first_name && (
                <p className="text-xs text-error mt-1">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Apelido</label>
              <input className={inputClass} {...form.register('last_name')} />
              {form.formState.errors.last_name && (
                <p className="text-xs text-error mt-1">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Nome da Organização</label>
            <input
              className={inputClass}
              placeholder="Ex: Federação Nacional de Futebol"
              {...form.register('organization_name')}
            />
            {form.formState.errors.organization_name && (
              <p className="text-xs text-error mt-1">{form.formState.errors.organization_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className={labelClass}>Tipo</label>
              <select className={inputClass} {...form.register('organization_type')}>
                <option value="federation">Federação</option>
                <option value="association">Associação</option>
                <option value="league">Liga</option>
                <option value="organizer">Organizador</option>
                <option value="academy">Academia</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>País</label>
              <select className={inputClass} {...form.register('country')}>
                <option value="AO">Angola</option>
                <option value="MZ">Moçambique</option>
                <option value="PT">Portugal</option>
                <option value="BR">Brasil</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-error mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Telemóvel (Opcional)</label>
            <input type="tel" className={inputClass} {...form.register('phone')} />
          </div>

          <div>
            <label className={labelClass}>Senha</label>
            <input type="password" className={inputClass} {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-xs text-error mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Confirmar Senha</label>
            <input type="password" className={inputClass} {...form.register('password_confirm')} />
            {form.formState.errors.password_confirm && (
              <p className="text-xs text-error mt-1">{form.formState.errors.password_confirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-primary text-on-primary-fixed px-lg py-md font-bold rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {registerMutation.isPending ? 'A criar conta...' : 'Criar Organização e Iniciar Setup'}
          </button>
        </form>

        <p className="mt-lg text-center text-sm text-on-surface-variant">
          Já tem conta?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary font-bold underline">
            Fazer Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
