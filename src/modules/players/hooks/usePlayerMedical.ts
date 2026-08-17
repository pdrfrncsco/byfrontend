// Players module — Medical hooks (migrated to apiClient)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  MedicalDocument,
  PlayerMedicalProfile,
  PlayerMedicalProfileUpdate,
  MedicalDocumentCreate,
  MedicalDocumentReject,
} from '../types'

export type { MedicalDocument, PlayerMedicalProfile, PlayerMedicalProfileUpdate, MedicalDocumentCreate, MedicalDocumentReject }
export type MedicalProfile = PlayerMedicalProfile
export type MedicalDocumentRecord = MedicalDocument
import {
  getPlayerMedicalProfile,
  getPlayerMedicalHistory,
  listPlayerMedicalDocuments,
  updatePlayerMedicalProfile,
  createPlayerMedicalDocument,
  verifyMedicalDocument,
  rejectMedicalDocument,
} from '../services'
import { playerKeys } from './usePlayerQueries'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const medicalKeys = {
  all: playerKeys.medical,
  profile: playerKeys.medical,
  history: playerKeys.medicalHistory,
  documents: playerKeys.medicalDocuments,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePlayerMedicalProfile(playerId: string, enabled = true) {
  return useQuery({
    queryKey: medicalKeys.profile(playerId),
    queryFn: () => getPlayerMedicalProfile(playerId),
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlayerMedicalHistory(playerId: string, enabled = true) {
  return useQuery({
    queryKey: medicalKeys.history(playerId),
    queryFn: async () => {
      return getPlayerMedicalHistory(playerId)
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlayerMedicalDocuments(playerId: string, enabled = true) {
  return useQuery({
    queryKey: medicalKeys.documents(playerId),
    queryFn: async () => {
      return listPlayerMedicalDocuments(playerId)
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useUpdateMedicalProfile(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: PlayerMedicalProfileUpdate) => {
      return updatePlayerMedicalProfile(playerId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalKeys.profile(playerId) })
      queryClient.invalidateQueries({ queryKey: medicalKeys.history(playerId) })
    },
  })
}

export function useUploadMedicalDocument(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: MedicalDocumentCreate) => {
      return createPlayerMedicalDocument(playerId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalKeys.documents(playerId) })
      queryClient.invalidateQueries({ queryKey: medicalKeys.history(playerId) })
    },
  })
}

export function useVerifyMedicalDocument(playerId: string, documentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      return verifyMedicalDocument(playerId, documentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalKeys.documents(playerId) })
    },
  })
}

export function useRejectMedicalDocument(playerId: string, documentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: MedicalDocumentReject) => {
      return rejectMedicalDocument(playerId, documentId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalKeys.documents(playerId) })
    },
  })
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getBloodTypeOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'unknown', label: 'Desconhecido' },
  ]
}

export function getMedicalStatusInfo(status: string): {
  label: string; color: string; bgColor: string; icon: string
} {
  const map: Record<string, ReturnType<typeof getMedicalStatusInfo>> = {
    fit:               { label: 'Apto',                 color: 'text-green-700',  bgColor: 'bg-green-100',  icon: '✅' },
    injured:           { label: 'Lesionado',            color: 'text-red-700',    bgColor: 'bg-red-100',    icon: '🤕' },
    recovering:        { label: 'Em Recuperação',       color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⏳' },
    suspended_medical: { label: 'Suspenso (Médico)',    color: 'text-gray-700',   bgColor: 'bg-gray-100',   icon: '⛔' },
  }
  return map[status] ?? map['fit']
}

export function getMedicalDocumentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    medical_certificate: 'Certificado Médico',
    injury_report:       'Relatório de Lesão',
    scan_result:         'Resultado de Exame',
    lab_result:          'Resultado Laboratorial',
    vaccination_record:  'Registo de Vacinação',
    surgery_report:      'Relatório de Cirurgia',
    physical_exam:       'Exame Físico',
    cardiac_screening:   'Rastreio Cardíaco',
    other:               'Outro',
  }
  return map[type] ?? type
}

export function getDocumentVerificationStatusInfo(status: string): {
  label: string; color: string; bgColor: string; icon: string
} {
  const map: Record<string, ReturnType<typeof getDocumentVerificationStatusInfo>> = {
    pending:  { label: 'Pendente',   color: 'text-blue-700',  bgColor: 'bg-blue-100',  icon: '⏳' },
    verified: { label: 'Verificado', color: 'text-green-700', bgColor: 'bg-green-100', icon: '✅' },
    rejected: { label: 'Rejeitado',  color: 'text-red-700',   bgColor: 'bg-red-100',   icon: '❌' },
    expired:  { label: 'Expirado',   color: 'text-gray-700',  bgColor: 'bg-gray-100',  icon: '⏱️' },
  }
  return map[status] ?? map['pending']
}

export function isMedicalProfileComplete(profile: Partial<PlayerMedicalProfile>): boolean {
  return !!(
    profile.blood_type &&
    profile.blood_type !== 'unknown' &&
    profile.medical_status &&
    profile.last_medical_exam
  )
}

export function formatExamDate(dateString: string | undefined | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('pt-PT')
}

export function isExamOverdue(nextExamDate: string | undefined | null): boolean {
  if (!nextExamDate) return false
  return new Date(nextExamDate) < new Date()
}

export function getDaysUntilExam(nextExamDate: string | undefined | null): number | null {
  if (!nextExamDate) return null
  return Math.ceil((new Date(nextExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}
