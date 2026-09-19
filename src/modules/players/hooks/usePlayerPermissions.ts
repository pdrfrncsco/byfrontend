import { useMemo } from 'react'
import { useAuth } from '@/app/providers'
import { useCurrentPlayer } from './useCurrentPlayer'
import type { Player, PlayerDetail } from '../types'

export interface PlayerPermissions {
  /** True se o utilizador autenticado for o próprio atleta */
  isSelf: boolean
  /** True se for dirigente ou staff de clube/organização */
  isClubStaff: boolean
  /** True se pertencer ao corpo clínico (médico, fisioterapeuta) */
  isMedicalStaff: boolean
  /** True se for agente desportivo ou scout licenciado */
  isAgent: boolean
  /** True se for administrador da plataforma/tenant */
  isPlatformAdmin: boolean

  // Permissões de Acesso a Dados
  canViewMedical: boolean
  canEditMedical: boolean
  canViewContracts: boolean
  canEditContracts: boolean
  canViewDocuments: boolean
  canUploadDocuments: boolean
  canEditProfile: boolean
  canManageRegistrations: boolean
  canTransfer: boolean
  canViewPrivateDetails: boolean
}

const CLUB_STAFF_ROLES = ['owner', 'admin', 'club_admin', 'manager', 'club', 'executive', 'coach']
const MEDICAL_ROLES = ['doctor', 'medical_staff', 'medic', 'physio', 'medical']
const AGENT_ROLES = ['agent', 'scout']
const ADMIN_ROLES = ['owner', 'admin', 'platform_admin', 'executive']

/**
 * usePlayerPermissions — determina os privilégios e visibilidade do utilizador
 * autenticado em relação a um jogador específico ou ao seu próprio perfil.
 */
export function usePlayerPermissions(targetPlayer?: Player | PlayerDetail | null): PlayerPermissions {
  const { user } = useAuth()
  const { player: currentPlayer } = useCurrentPlayer()

  return useMemo(() => {
    if (!user) {
      return {
        isSelf: false,
        isClubStaff: false,
        isMedicalStaff: false,
        isAgent: false,
        isPlatformAdmin: false,
        canViewMedical: false,
        canEditMedical: false,
        canViewContracts: false,
        canEditContracts: false,
        canViewDocuments: false,
        canUploadDocuments: false,
        canEditProfile: false,
        canManageRegistrations: false,
        canTransfer: false,
        canViewPrivateDetails: false,
      }
    }

    const rolesList = user.roles ?? []
    const allRoles = new Set<string>(
      [...rolesList, user.role, user.profileType].filter((r): r is string => Boolean(r))
    )

    const isPlatformAdmin = ADMIN_ROLES.some((r) => allRoles.has(r))
    const isClubStaff = isPlatformAdmin || CLUB_STAFF_ROLES.some((r) => allRoles.has(r))
    const isMedicalStaff = isPlatformAdmin || MEDICAL_ROLES.some((r) => allRoles.has(r))
    const isAgent = isPlatformAdmin || AGENT_ROLES.some((r) => allRoles.has(r))

    // Verificar se o jogador alvo é o próprio utilizador
    const targetId = targetPlayer?.id
    const targetUserId = (targetPlayer as Record<string, unknown> | undefined)?.user
      || (targetPlayer as Record<string, unknown> | undefined)?.user_id

    const isSelf = Boolean(
      (currentPlayer?.id && targetId && currentPlayer.id === targetId) ||
      (currentPlayer?.slug && targetPlayer?.slug && currentPlayer.slug === targetPlayer.slug) ||
      (targetUserId && targetUserId === user.id) ||
      (!targetPlayer && currentPlayer)
    )

    const canViewMedical = isMedicalStaff || isSelf
    const canEditMedical = isMedicalStaff
    const canViewContracts = isClubStaff || isSelf || isAgent
    const canEditContracts = isClubStaff
    const canViewDocuments = isClubStaff || isSelf || isAgent
    const canUploadDocuments = isClubStaff || isSelf
    const canEditProfile = isSelf || isClubStaff
    const canManageRegistrations = isClubStaff
    const canTransfer = isClubStaff
    const canViewPrivateDetails = isSelf || isClubStaff

    return {
      isSelf,
      isClubStaff,
      isMedicalStaff,
      isAgent,
      isPlatformAdmin,
      canViewMedical,
      canEditMedical,
      canViewContracts,
      canEditContracts,
      canViewDocuments,
      canUploadDocuments,
      canEditProfile,
      canManageRegistrations,
      canTransfer,
      canViewPrivateDetails,
    }
  }, [user, currentPlayer, targetPlayer])
}
