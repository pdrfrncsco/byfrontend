import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attachMediaUsage, deleteMediaAsset, detachMediaUsage, getMediaAsset, listMediaAssets, listMediaUsages, uploadMediaAsset } from './services'

export const mediaKeys = {
  all: ['media-assets'] as const,
  list: (params: Record<string, string | number>) => [...mediaKeys.all, 'list', params] as const,
  detail: (id: string) => [...mediaKeys.all, 'detail', id] as const,
  usages: (ownerType: string, ownerId: string) => [...mediaKeys.all, 'usages', ownerType, ownerId] as const,
}

export function useMediaAssets(params: Record<string, string | number> = {}) {
  return useQuery({ queryKey: mediaKeys.list(params), queryFn: () => listMediaAssets(params), staleTime: 30_000 })
}

export function useUploadMediaAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, ownerId, ownerType, category }: { file: File; ownerId: string; ownerType: 'organization' | 'club' | 'player'; category?: string }) =>
      uploadMediaAsset(file, ownerId, ownerType, category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })
}

export function useDeleteMediaAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })
}

export function useMediaAsset(id: string | null) {
  return useQuery({
    queryKey: mediaKeys.detail(id ?? ''),
    queryFn: () => getMediaAsset(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}

export function useMediaUsages(ownerType: string, ownerId?: string | null) {
  return useQuery({
    queryKey: mediaKeys.usages(ownerType, ownerId ?? ''),
    queryFn: () => listMediaUsages(ownerType, ownerId as string),
    enabled: Boolean(ownerId),
    staleTime: 30_000,
  })
}

export function useAttachMediaUsage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assetId, ownerType, ownerId, role }: { assetId: string; ownerType: string; ownerId: string; role: string }) =>
      attachMediaUsage(assetId, ownerType, ownerId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })
}

export function useDetachMediaUsage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: detachMediaUsage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  })
}