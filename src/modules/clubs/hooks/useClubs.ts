import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/modules/clubs/services'
import type { Club, ClubMember } from '@/modules/clubs/types'

export function useClubs(params?: Record<string, any>) {
  return useQuery<any>({
    queryKey: ['clubs', params],
    queryFn: () => service.listClubs(params),
  })
}

export function useClub(id?: string) {
  return useQuery<any>({
    queryKey: ['club', id],
    queryFn: () => (id ? service.getClub(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useCreateClub() {
  const qc = useQueryClient()
  return useMutation<any, Error, Partial<Club>>({
    mutationFn: (payload) => service.createClub(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clubs'] }),
  })
}

export function useUpdateClub() {
  const qc = useQueryClient()
  return useMutation<any, Error, { id: string; payload: Partial<Club> }>({
    mutationFn: ({ id, payload }) => service.updateClub(id, payload),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['club', vars.id] }),
  })
}

export function useUploadClubLogo() {
  const qc = useQueryClient()
  return useMutation<any, Error, { id: string; file: File }>({
    mutationFn: ({ id, file }) => service.uploadClubLogo(id, file),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['club', vars.id] }),
  })
}

// Members hooks
export function useClubMembers(clubId?: string) {
  return useQuery<any>({
    queryKey: ['club', clubId, 'members'],
    queryFn: () => (clubId ? service.listClubMembers(clubId) : Promise.resolve([])),
    enabled: !!clubId,
  })
}

export function useAddClubMember() {
  const qc = useQueryClient()
  return useMutation<any, Error, { clubId: string; payload: Partial<ClubMember> }>({
    mutationFn: ({ clubId, payload }) => service.addClubMember(clubId, payload),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['club', vars.clubId, 'members'] }),
  })
}

export function useUpdateClubMember() {
  const qc = useQueryClient()
  return useMutation<any, Error, { clubId: string; memberId: string; payload: Partial<ClubMember> }>({
    mutationFn: ({ clubId, memberId, payload }) => service.updateClubMember(clubId, memberId, payload),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['club', vars.clubId, 'members'] }),
  })
}

export function useRemoveClubMember() {
  const qc = useQueryClient()
  return useMutation<any, Error, { clubId: string; memberId: string }>({
    mutationFn: ({ clubId, memberId }) => service.removeClubMember(clubId, memberId),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['club', vars.clubId, 'members'] }),
  })
}
