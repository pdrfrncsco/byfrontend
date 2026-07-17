import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/app/layouts'
import { useRegister } from '@/modules/auth/hooks'
import { registerSchema, type RegisterFormData } from '@/modules/auth/schemas'
import { ROUTES } from '@/constants/routes'
import { useSeo } from '@/hooks/useSeo'
import type { RegisterRequest } from '@/types'
import { ArrowRight } from 'lucide-react'

interface RegisterProfilePageProps {
  profileType: NonNullable<RegisterRequest['profile_type']>
  title: string
  description: string
  submitLabel: string
  path: string
}

const inputClass =
  'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm'
const labelClass = 'block font-title-md text-on-surface mb-sm text-xs'

export function RegisterProfilePage({
  profileType,
  title,
  description,
  submitLabel,
  path,
}: RegisterProfilePageProps) {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  useSeo({
    title,
    description,
    path,
  })

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerMutation.mutateAsync({
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined,
      profile_type: profileType,
    })

    if (result) {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout>
      <div className="glass-panel w-full max-w-lg rounded-xl border border-outline-variant p-xl">
        <div className="mb-lg">
          <h1 className="text-center font-display-lg text-headline-lg text-on-surface">{title}</h1>
          <p className="mt-sm text-center text-sm text-on-surface-variant">{description}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-md">
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className={labelClass} htmlFor="first_name">
                Nome
              </label>
              <input id="first_name" className={inputClass} {...form.register('first_name')} />
              {form.formState.errors.first_name && (
                <p className="mt-1 text-xs text-error">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="last_name">
                Apelido
              </label>
              <input id="last_name" className={inputClass} {...form.register('last_name')} />
              {form.formState.errors.last_name && (
                <p className="mt-1 text-xs text-error">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input id="email" type="email" className={inputClass} {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="phone">
              Telemóvel (Opcional)
            </label>
            <input id="phone" type="tel" className={inputClass} {...form.register('phone')} />
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              Senha
            </label>
            <input id="password" type="password" className={inputClass} {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="password_confirm">
              Confirmar Senha
            </label>
            <input
              id="password_confirm"
              type="password"
              className={inputClass}
              {...form.register('password_confirm')}
            />
            {form.formState.errors.password_confirm && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.password_confirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-lg py-md font-bold text-on-primary-fixed transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {registerMutation.isPending ? 'A criar conta...' : submitLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-lg text-center text-sm text-on-surface-variant">
          Depois do registo, poderá completar o seu perfil no dashboard.
        </p>

        <div className="mt-md text-center">
          <Link to={ROUTES.REGISTER} className="text-sm font-medium text-primary underline">
            Voltar ao seletor de registo
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
