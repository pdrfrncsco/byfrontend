import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface BloodType {
  value: string
  label: string
}

export interface MedicalProfile {
  player: string
  blood_type: string
  medical_status: 'fit' | 'injured' | 'recovering' | 'suspended_medical'
  injury_status?: string
  medical_clearance: boolean
  fitness_status?: string
  medical_notes?: string
  last_medical_exam?: string
  next_medical_exam?: string
  allergies?: string
  current_medications?: string
  medical_conditions?: string
  is_fit_to_play?: boolean
  needs_medical_exam?: boolean
  created_at: string
  updated_at: string
}

export interface MedicalDocument {
  id: string
  player: string
  document_type: string
  title: string
  description?: string
  file?: {
    id: string
    url: string
    name: string
  }
  issued_at: string
  expires_at?: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired'
  verified_by?: string
  verified_at?: string
  is_confidential: boolean
  is_valid?: boolean
  is_expired?: boolean
  created_at: string
  updated_at: string
}

export interface MedicalHistory {
  profile: MedicalProfile
  documents: MedicalDocument[]
  timeline: Array<{
    date: string
    event: string
    status: string
  }>
}

export interface UpdateMedicalProfileInput {
  blood_type?: string
  medical_status?: string
  injury_status?: string
  medical_clearance?: boolean
  fitness_status?: string
  medical_notes?: string
  last_medical_exam?: string
  next_medical_exam?: string
  allergies?: string
  current_medications?: string
  medical_conditions?: string
}

/**
 * Hook to fetch player medical profile
 */
export function usePlayerMedicalProfile(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-medical-profile', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/medical/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // Profile doesn't exist yet
        }
        throw new Error(`Failed to fetch medical profile: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to fetch complete medical history
 */
export function usePlayerMedicalHistory(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-medical-history', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/medical/history/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch medical history: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to fetch medical documents
 */
export function usePlayerMedicalDocuments(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-medical-documents', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/medical/documents/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch medical documents: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to update medical profile
 */
export function useUpdateMedicalProfile(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: UpdateMedicalProfileInput) => {
      const response = await fetch(`${apiUrl}/players/${playerId}/medical/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to update medical profile: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-medical-profile', playerId] })
      queryClient.invalidateQueries({ queryKey: ['player-medical-history', playerId] })
    },
  })
}

/**
 * Hook to upload medical document
 */
export function useUploadMedicalDocument(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${apiUrl}/players/${playerId}/medical/documents/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: data,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-medical-documents', playerId] })
      queryClient.invalidateQueries({ queryKey: ['player-medical-history', playerId] })
    },
  })
}

/**
 * Hook to verify medical document (staff-only)
 */
export function useVerifyMedicalDocument(playerId: string, documentId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/medical/documents/${documentId}/verify/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to verify document: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-medical-documents', playerId] })
    },
  })
}

/**
 * Hook to reject medical document (staff-only)
 */
export function useRejectMedicalDocument(playerId: string, documentId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/medical/documents/${documentId}/reject/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ reason }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to reject document: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-medical-documents', playerId] })
    },
  })
}

/**
 * Get blood type options
 */
export function getBloodTypeOptions(): BloodType[] {
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

/**
 * Get medical status info
 */
export function getMedicalStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  icon: string
} {
  const statusMap: Record<string, any> = {
    fit: {
      label: 'Apto',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: '✅',
    },
    injured: {
      label: 'Lesionado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: '🤕',
    },
    recovering: {
      label: 'Em Recuperação',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: '⏳',
    },
    suspended_medical: {
      label: 'Suspenso (Médico)',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: '⛔',
    },
  }

  return statusMap[status] || statusMap['fit']
}

/**
 * Get medical document type label
 */
export function getMedicalDocumentTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    medical_certificate: 'Certificado Médico',
    injury_report: 'Relatório de Lesão',
    scan_result: 'Resultado de Exame',
    lab_result: 'Resultado Laboratorial',
    vaccination_record: 'Registo de Vacinação',
    surgery_report: 'Relatório de Cirurgia',
    physical_exam: 'Exame Físico',
    cardiac_screening: 'Rastreio Cardíaco',
    other: 'Outro',
  }

  return typeMap[type] || type
}

/**
 * Get document verification status info
 */
export function getDocumentVerificationStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  icon: string
} {
  const statusMap: Record<string, any> = {
    pending: {
      label: 'Pendente',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: '⏳',
    },
    verified: {
      label: 'Verificado',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: '✅',
    },
    rejected: {
      label: 'Rejeitado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: '❌',
    },
    expired: {
      label: 'Expirado',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: '⏱️',
    },
  }

  return statusMap[status] || statusMap['pending']
}

/**
 * Check if medical profile is complete
 */
export function isMedicalProfileComplete(profile: Partial<MedicalProfile>): boolean {
  return !!(
    profile.blood_type &&
    profile.blood_type !== 'unknown' &&
    profile.medical_status &&
    profile.last_medical_exam &&
    profile.allergies !== undefined &&
    profile.current_medications !== undefined
  )
}

/**
 * Format exam date
 */
export function formatExamDate(dateString: string | undefined): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('pt-PT')
}

/**
 * Check if exam is overdue
 */
export function isExamOverdue(nextExamDate: string | undefined): boolean {
  if (!nextExamDate) return false
  return new Date(nextExamDate) < new Date()
}

/**
 * Get days until next exam
 */
export function getDaysUntilExam(nextExamDate: string | undefined): number | null {
  if (!nextExamDate) return null

  const exam = new Date(nextExamDate)
  const today = new Date()
  const diffTime = exam.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
