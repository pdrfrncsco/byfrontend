import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi, type ProfileUpdateData } from '@/modules/auth/services/auth.api'
import { useAuth } from '@/app/providers/AuthProvider'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from '@/types'

/* ──────────────────────────────────────────────
 * useLogin
 * ────────────────────────────────────────────── */
export function useLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (credentials: LoginRequest): Promise<LoginResponse> => {
      return authApi.login(credentials)
    },
    onSuccess: async (data) => {
      await login(data.access, data.refresh, data.user)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Email ou palavra-passe incorretos.'
      toast.error(message)
    },
  })
}

/* ──────────────────────────────────────────────
 * useRegister
 * ────────────────────────────────────────────── */
export function useRegister() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (data: RegisterRequest): Promise<LoginResponse> => {
      return authApi.register(data)
    },
    onSuccess: async (data) => {
      await login(data.access, data.refresh, data.user)
      toast.success('Conta criada com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao efetuar o registo. Verifique os dados introduzidos.'
      toast.error(message)
    },
  })
}

/* ──────────────────────────────────────────────
 * useLogout
 * ────────────────────────────────────────────── */
export function useLogout() {
  const { logout } = useAuth()

  return useMutation({
    mutationFn: (refreshToken: string) => {
      return authApi.logout(refreshToken)
    },
    onSuccess: () => {
      logout()
    },
    onError: () => {
      // Even if the backend call fails, clear local state
      logout()
    },
  })
}

/* ──────────────────────────────────────────────
 * useForgotPassword
 * ────────────────────────────────────────────── */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => {
      return authApi.forgotPassword(email)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Ocorreu um erro. Por favor tente novamente.'
      toast.error(message)
    },
  })
}

/* ──────────────────────────────────────────────
 * useResetPassword
 * ────────────────────────────────────────────── */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: {
      token: string
      new_password: string
      new_password_confirm: string
    }) => {
      return authApi.resetPassword(data)
    },
    onSuccess: () => {
      toast.success('Palavra-passe redefinida com sucesso!')
    },
    onError: (error: any) => {
      const data = error?.response?.data
      const message =
        data?.errors?.new_password?.join(' ') ||
        data?.message ||
        'Ocorreu um erro. O link pode ter expirado. Por favor solicite um novo.'
      toast.error(message)
    },
  })
}

/* ──────────────────────────────────────────────
 * useUpdateProfile
 * ────────────────────────────────────────────── */
export function useUpdateProfile() {
  const { refreshUser } = useAuth()

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => {
      return authApi.updateMe(data)
    },
    onSuccess: async () => {
      await refreshUser()
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar perfil.'
      toast.error(message)
    },
  })
}

/* ──────────────────────────────────────────────
 * useChangePassword
 * ────────────────────────────────────────────── */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: {
      old_password: string
      new_password: string
      new_password_confirm: string
    }) => {
      return authApi.changePassword(data)
    },
    onSuccess: () => {
      toast.success('Palavra-passe alterada com sucesso!')
    },
    onError: (error: any) => {
      const data = error?.response?.data
      let message: string
      if (data?.errors?.old_password) {
        message = 'A palavra-passe atual está incorreta.'
      } else if (data?.errors?.new_password) {
        message = data.errors.new_password.join(' ')
      } else {
        message = data?.message || 'Erro ao alterar palavra-passe.'
      }
      toast.error(message)
    },
  })
}
