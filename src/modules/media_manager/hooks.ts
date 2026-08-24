import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMediaAsset, listMediaAssets, uploadMediaAsset } from './services'

export const mediaKeys = {
  all: ['media-assets'] as const,
  list: (params: Record<string, string>) => [...mediaKeys.all, 'list', params] as const,
}

export function useMediaAssets(params: Record<string, string> = {}) {
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