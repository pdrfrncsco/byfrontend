import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types/api'
import type {
  Transfer,
  TransferListParams,
  CreateTransferPayload,
  PaginatedTransfers,
  TransferListFlat,
  TransferStatus,
  TransferType,
} from '../types'

type Envelope<T> = ApiResponse<T> | T

type PaginatedEnvelope<T> =
  | ApiResponse<PaginatedTransfers>
  | PaginatedTransfers
  | { count?: number; next?: string | null; previous?: string | null; results: T[] }
  | T[]

function hasData<T>(payload: unknown): payload is ApiResponse<T> {
  return !!payload && typeof payload === 'object' && 'data' in payload && 'success' in payload
}

function unwrapData<T>(payload: Envelope<T>): T {
  return hasData<T>(payload) ? payload.data : payload
}

function unwrapPaginated<T>(payload: PaginatedEnvelope<T>): PaginatedTransfers {
  const data = hasData<PaginatedTransfers>(payload) ? payload.data : payload
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as unknown as Transfer[],
    }
  }

  if (data && typeof data === 'object' && 'results' in data) {
    const results = Array.isArray((data as { results?: unknown[] }).results)
      ? (data as { results: unknown[] }).results
      : []
    return {
      count: typeof (data as { count?: number }).count === 'number' ? (data as { count: number }).count : results.length,
      next: (data as { next?: string | null }).next ?? null,
      previous: (data as { previous?: string | null }).previous ?? null,
      results: results as Transfer[],
    }
  }

  return { count: 0, next: null, previous: null, results: [] }
}

function isFlatListItem(raw: unknown): raw is TransferListFlat {
  return (
    !!raw &&
    typeof raw === 'object' &&
    'player_name' in raw &&
    !('player' in raw && typeof (raw as { player?: unknown }).player === 'object')
  )
}

/** Normalise list (flat) and detail (nested) payloads into the canonical Transfer shape. */
export function normalizeTransfer(raw: Transfer | TransferListFlat | Record<string, unknown>): Transfer {
  if (!isFlatListItem(raw) && raw && typeof raw === 'object' && 'player' in raw) {
    const nested = raw as Transfer
    return {
      ...nested,
      from_club: nested.from_club ?? null,
      to_club: nested.to_club,
    }
  }

  const flat = raw as TransferListFlat
  return {
    id: flat.id,
    player: {
      id: '',
      full_name: flat.player_name || '—',
      primary_position: null,
    },
    from_club: flat.from_club_name
      ? { id: '', name: flat.from_club_name, slug: '' }
      : null,
    to_club: {
      id: '',
      name: flat.to_club_name || '—',
      slug: '',
    },
    transfer_type: flat.transfer_type as TransferType,
    transfer_type_display: flat.transfer_type_display,
    transfer_date: flat.transfer_date,
    status: flat.status as TransferStatus,
    status_display: flat.status_display,
    loan_end_date: flat.loan_end_date,
    fee: flat.fee,
  }
}

function extractTransfer(payload: unknown): Transfer {
  if (payload && typeof payload === 'object' && 'transfer' in payload) {
    return normalizeTransfer((payload as { transfer: Transfer }).transfer)
  }
  return normalizeTransfer(unwrapData(payload as Envelope<Transfer>))
}

const BASE = API_ROUTES.TRANSFERS

export const transferApi = {
  async list(params?: TransferListParams): Promise<PaginatedTransfers> {
    const response = await client.get<PaginatedEnvelope<Transfer | TransferListFlat>>(BASE.LIST, { params })
    const page = unwrapPaginated(response.data)
    return {
      ...page,
      results: page.results.map((item) => normalizeTransfer(item)),
    }
  },

  async get(id: string): Promise<Transfer> {
    const response = await client.get<Envelope<Transfer>>(BASE.GET(id))
    return normalizeTransfer(unwrapData(response.data))
  },

  async create(data: CreateTransferPayload): Promise<Transfer> {
    const response = await client.post<Envelope<Transfer>>(BASE.CREATE, data)
    return normalizeTransfer(unwrapData(response.data))
  },

  async approve(id: string): Promise<Transfer> {
    const response = await client.post<Envelope<Transfer>>(BASE.APPROVE(id))
    return normalizeTransfer(unwrapData(response.data))
  },

  async reject(id: string, reason = ''): Promise<Transfer> {
    const response = await client.post<Envelope<Transfer>>(BASE.REJECT(id), { reason })
    return normalizeTransfer(unwrapData(response.data))
  },

  async complete(id: string): Promise<Transfer> {
    const response = await client.post(BASE.COMPLETE(id))
    return extractTransfer(response.data)
  },

  async cancel(id: string, reason = ''): Promise<Transfer> {
    const response = await client.post<Envelope<Transfer>>(BASE.CANCEL(id), { reason })
    return normalizeTransfer(unwrapData(response.data))
  },

  async pendingApprovals(clubId?: string): Promise<Transfer[]> {
    const response = await client.get<{ results: Array<Transfer | TransferListFlat> }>(BASE.PENDING_APPROVALS, {
      params: clubId ? { club_id: clubId } : undefined,
    })
    const results = response.data?.results ?? []
    return results.map((item) => normalizeTransfer(item))
  },

  async activeLoans(clubId?: string): Promise<Transfer[]> {
    const response = await client.get<{ results: Array<Transfer | TransferListFlat> }>(BASE.ACTIVE_LOANS, {
      params: clubId ? { club_id: clubId } : undefined,
    })
    const results = response.data?.results ?? []
    return results.map((item) => normalizeTransfer(item))
  },

  async expiringLoans(days = 30): Promise<Transfer[]> {
    const response = await client.get<{ results: Array<Transfer | TransferListFlat> }>(BASE.EXPIRING_LOANS, {
      params: { days },
    })
    const results = response.data?.results ?? []
    return results.map((item) => normalizeTransfer(item))
  },

  async extendLoan(id: string, newEndDate: string): Promise<Transfer> {
    const response = await client.post<Envelope<Transfer>>(BASE.EXTEND_LOAN(id), {
      new_end_date: newEndDate,
    })
    return normalizeTransfer(unwrapData(response.data))
  },

  async returnLoan(id: string): Promise<Transfer> {
    const response = await client.post(BASE.RETURN_LOAN(id))
    return extractTransfer(response.data)
  },

  async makePermanent(id: string, fee?: number | null): Promise<Transfer> {
    const response = await client.post<Envelope<Transfer>>(BASE.MAKE_PERMANENT(id), {
      fee: fee ?? null,
    })
    return normalizeTransfer(unwrapData(response.data))
  },
}
