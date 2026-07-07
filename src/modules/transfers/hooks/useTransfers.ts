import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/providers'
import { transferApi } from '../services'
import type { TransferListParams } from '../types'

export const transferKeys = {
  all: ['transfers'] as const,
  list: (params?: TransferListParams) => ['transfers', 'list', params] as const,
}

export function useTransfers(params?: TransferListParams) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => transferApi.list(params),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  })
}
