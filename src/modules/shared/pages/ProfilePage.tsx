import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/app/providers/AuthProvider'
import { useUpdateProfile, useChangePassword, useLogout } from '@/modules/auth/hooks'
import {
  profileUpdateSchema,
  changePasswordSchema,
  type ProfileUpdateFormData,
  type ChangePasswordFormData,
} from '@/modules/auth/schemas'
import { User, Save, Lock, Shield, ChevronRight } from 'lucide-react'

type Tab = 'profile' | 'security' | 'memberships'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout: authLogout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const logoutMutation = useLogout()

  /* ── Profile Form ── */
  const profileForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: user?.username?.split(' ')[0] || '',
      last_name: user?.username?.split(' ').slice(1).join(' ') || '',
      phone: '',
      language: 'pt',
    },
  })

  /* ── Password Form ── */
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  })

  const onProfileUpdate = async (data: ProfileUpdateFormData) => {
    await updateProfileMutation.mutateAsync(data)
  }

  const onPasswordChange = async (data: ChangePasswordFormData) => {
    await changePasswordMutation.mutateAsync(data)
    if (changePasswordMutation.isSuccess) {
      passwordForm.reset()
    }
  }

  const handleLogout = () => {
    const refresh = localStorage.getItem('bolayetu_refresh')
    if (refresh) {
      logoutMutation.mutate(refresh)
    } else {
      authLogout()
    }
    navigate('/login')
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Perfil', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <Lock className="w-4 h-4" /> },
    { id: 'memberships', label: 'Organizações', icon: <Shield className="w-4 h-4" /> },
  ]

  /* ── Shared classes ── */
  const inputClass =
    'w-full px-md py-sm bg-[#000f21] border border-[#26364a] rounded-lg text-[#d3e4fe] text-sm focus:outline-none focus:border-[#94d3c1] transition-colors'
  const labelClass =
    'block text-xs font-semibold text-on-surface-variant mb-sm uppercase tracking-wider'

  // Password strength indicator
  const newPassword = passwordForm.watch('new_password')
  const passwordRequirements: [string, boolean][] = [
    ['Mínimo 8 caracteres', (newPassword?.length || 0) >= 8],
    ['Uma letra maiúscula', /[A-Z]/.test(newPassword || '')],
    ['Um dígito', /[0-9]/.test(newPassword || '')],
    ['Um carácter especial', /[^A-Za-z0-9]/.test(newPassword || '')],
  ]

  return (
    <div className="min-h-screen bg-[#031427] text-[#d3e4fe]">
      {/* Background */}
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 h-16 flex items-center px-lg bg-[#0b1c30]/80 border-b border-[#26364a]/40 backdrop-blur-xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors text-sm group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h1 className="ml-auto font-display-lg text-lg text-[#94d3c1] uppercase tracking-wider">
          Perfil
        </h1>
      </header>

      <div className="max-w-3xl mx-auto p-lg space-y-lg">
        {/* User Avatar Card */}
        <div className="glass-panel rounded-xl p-lg border border-[#26364a] flex items-center gap-lg">
          <div className="w-16 h-16 rounded-full bg-[#1b2b3f] flex items-center justify-center border-2 border-[#94d3c1] shrink-0">
            <span className="text-2xl font-bold text-[#94d3c1] uppercase">
              {user?.username?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-display-lg text-xl text-[#d3e4fe]">{user?.username || 'Utilizador'}</p>
            <p className="text-sm text-on-surface-variant">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary/20 text-[#94d3c1] border border-primary/30 px-sm py-0.5 rounded-full font-semibold uppercase tracking-wide">
              {user?.role || 'Membro'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="ml-auto text-sm text-error hover:text-error/80 transition-colors font-semibold cursor-pointer disabled:opacity-50"
          >
            {logoutMutation.isPending ? 'A sair...' : 'Terminar Sessão'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-sm border-b border-[#26364a]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-sm px-md py-sm text-sm font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-[#94d3c1] border-[#94d3c1]'
                  : 'text-on-surface-variant border-transparent hover:text-[#d3e4fe]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form
            onSubmit={profileForm.handleSubmit(onProfileUpdate)}
            className="glass-panel rounded-xl p-lg border border-[#26364a] space-y-md"
          >
            <h2 className="font-display-lg text-lg text-[#d3e4fe]">Informações Pessoais</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className={labelClass}>Nome</label>
                <input
                  type="text"
                  placeholder="Primeiro nome"
                  className={inputClass}
                  {...profileForm.register('first_name')}
                />
                {profileForm.formState.errors.first_name && (
                  <p className="text-xs text-error mt-1">
                    {profileForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Apelido</label>
                <input
                  type="text"
                  placeholder="Apelido"
                  className={inputClass}
                  {...profileForm.register('last_name')}
                />
                {profileForm.formState.errors.last_name && (
                  <p className="text-xs text-error mt-1">
                    {profileForm.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-md py-sm bg-[#000f21]/50 border border-[#26364a]/50 rounded-lg text-on-surface-variant text-sm cursor-not-allowed"
              />
              <p className="text-xs text-on-surface-variant opacity-50 mt-1">
                O email não pode ser alterado diretamente.
              </p>
            </div>

            <div>
              <label className={labelClass}>Telemóvel</label>
              <input
                type="tel"
                placeholder="+244 923 000 000"
                className={inputClass}
                {...profileForm.register('phone')}
              />
              {profileForm.formState.errors.phone && (
                <p className="text-xs text-error mt-1">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Idioma</label>
              <select
                className={`${inputClass} cursor-pointer`}
                {...profileForm.register('language')}
              >
                <option value="pt">🇦🇴 Português</option>
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>

            <div className="pt-sm flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-sm bg-primary text-on-primary-fixed px-lg py-sm font-bold rounded-lg hover:scale-[1.02] transition-transform text-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? 'A Guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordChange)}
            className="glass-panel rounded-xl p-lg border border-[#26364a] space-y-md"
          >
            <h2 className="font-display-lg text-lg text-[#d3e4fe]">Alterar Palavra-passe</h2>

            <div>
              <label className={labelClass}>Palavra-passe Atual</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...passwordForm.register('old_password')}
              />
              {passwordForm.formState.errors.old_password && (
                <p className="text-xs text-error mt-1">
                  {passwordForm.formState.errors.old_password.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Nova Palavra-passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...passwordForm.register('new_password')}
              />
              {passwordForm.formState.errors.new_password && (
                <p className="text-xs text-error mt-1">
                  {passwordForm.formState.errors.new_password.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Confirmar Nova Palavra-passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...passwordForm.register('new_password_confirm')}
              />
              {passwordForm.formState.errors.new_password_confirm && (
                <p className="text-xs text-error mt-1">
                  {passwordForm.formState.errors.new_password_confirm.message}
                </p>
              )}
            </div>

            <div className="bg-[#000f21]/60 border border-[#26364a]/50 rounded-lg p-md text-xs text-on-surface-variant space-y-1">
              <p className="font-semibold text-[#d3e4fe] mb-sm">Requisitos da palavra-passe:</p>
              {passwordRequirements.map(([label, met]) => (
                <div key={label as string} className="flex items-center gap-sm">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-[#94d3c1]' : 'bg-[#26364a]'}`}
                  />
                  <span className={met ? 'text-[#94d3c1]' : ''}>{label as string}</span>
                </div>
              ))}
            </div>

            <div className="pt-sm flex justify-end">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-sm bg-primary text-on-primary-fixed px-lg py-sm font-bold rounded-lg hover:scale-[1.02] transition-transform text-sm disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {changePasswordMutation.isPending ? 'A Alterar...' : 'Alterar Palavra-passe'}
              </button>
            </div>
          </form>
        )}

        {/* Memberships Tab */}
        {activeTab === 'memberships' && (
          <div className="glass-panel rounded-xl p-lg border border-[#26364a] space-y-md">
            <h2 className="font-display-lg text-lg text-[#d3e4fe]">Organizações</h2>
            <p className="text-sm text-on-surface-variant">
              Organizações às quais a sua conta está associada e os respetivos cargos.
            </p>

            {user?.roles?.length === 0 || !user?.tenant_id ? (
              <div className="text-center py-xl text-on-surface-variant">
                <Shield className="w-12 h-12 mx-auto mb-md opacity-30" />
                <p className="text-sm">Ainda não pertence a nenhuma organização.</p>
                <p className="text-xs opacity-60 mt-sm">
                  Contacte um administrador para ser adicionado a uma organização.
                </p>
              </div>
            ) : (
              <div className="space-y-sm">
                {user?.tenant_id && (
                  <div className="flex items-center justify-between p-md bg-[#000f21] rounded-lg border border-[#26364a]/50">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-[#1b2b3f] flex items-center justify-center border border-[#26364a]">
                        <Shield className="w-5 h-5 text-[#94d3c1]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#d3e4fe]">Organização Atual</p>
                        <p className="text-xs text-on-surface-variant">{user.tenant_id}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/20 text-[#94d3c1] border border-primary/30 px-sm py-0.5 rounded-full font-bold uppercase">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
