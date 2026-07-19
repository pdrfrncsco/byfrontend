/**
 * Thin re-exports so legacy club service imports keep working.
 * Prefer importing from `@/modules/transfers` in new code.
 */
import { transferApi } from '@/modules/transfers/services'
import type { CreateTransferPayload, TransferListParams } from '@/modules/transfers/types'

export { transferApi }

export async function listTransfers(params?: TransferListParams) {
  return transferApi.list(params)
}

export async function getTransfer(id: string) {
  return transferApi.get(id)
}

export async function createTransfer(data: CreateTransferPayload) {
  return transferApi.create(data)
}

export async function approveTransfer(id: string) {
  return transferApi.approve(id)
}

export async function rejectTransfer(id: string, reason?: string) {
  return transferApi.reject(id, reason)
}
