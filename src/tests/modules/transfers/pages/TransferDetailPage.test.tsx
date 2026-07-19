import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Transfer } from '@/modules/transfers/types'

vi.mock('@/app/layouts/DashboardLayout', () => ({
  DashboardLayout: ({
    title,
    children,
    headerActions,
  }: {
    title: string
    children: ReactNode
    headerActions?: ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {headerActions}
      {children}
    </div>
  ),
}))

vi.mock('@/modules/clubs/constants/navigation', () => ({
  getClubSidebarLinks: () => [],
}))

vi.mock('@/modules/transfers/hooks', () => ({
  useTransferDetail: vi.fn(),
  useApproveTransfer: vi.fn(),
  useRejectTransfer: vi.fn(),
  useCompleteTransfer: vi.fn(),
  useCancelTransfer: vi.fn(),
  useExtendLoan: vi.fn(),
  useReturnLoan: vi.fn(),
  useMakeLoanPermanent: vi.fn(),
}))

import {
  useTransferDetail,
  useApproveTransfer,
  useRejectTransfer,
  useCompleteTransfer,
  useCancelTransfer,
  useExtendLoan,
  useReturnLoan,
  useMakeLoanPermanent,
} from '@/modules/transfers/hooks'
import { TransferDetailPage } from '@/modules/transfers/pages/TransferDetailPage'

const pendingPermanent: Transfer = {
  id: 't-1',
  player: { id: 'p-1', full_name: 'Ana Costa', primary_position: 'MF' },
  from_club: { id: 'c-1', name: 'FC Origem', slug: 'fc-origem' },
  to_club: { id: 'c-2', name: 'FC Destino', slug: 'fc-destino' },
  transfer_type: 'permanent',
  transfer_type_display: 'Permanent Transfer',
  transfer_date: '2026-07-10',
  status: 'pending',
  status_display: 'Awaiting Approval',
  fee: '1000',
}

const approvedTransfer: Transfer = {
  ...pendingPermanent,
  id: 't-2',
  status: 'approved',
  status_display: 'Approved',
}

function renderDetail(id = 't-1') {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/club/transfers/${id}`]}>
      <Routes>
        <Route path="/dashboard/club/transfers/:id" element={<TransferDetailPage scope="club" />} />
      </Routes>
    </MemoryRouter>,
  )
}

function mockIdleMutation() {
  return {
    isPending: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  } as never
}

describe('TransferDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useApproveTransfer).mockReturnValue(mockIdleMutation())
    vi.mocked(useRejectTransfer).mockReturnValue(mockIdleMutation())
    vi.mocked(useCompleteTransfer).mockReturnValue(mockIdleMutation())
    vi.mocked(useCancelTransfer).mockReturnValue(mockIdleMutation())
    vi.mocked(useExtendLoan).mockReturnValue(mockIdleMutation())
    vi.mocked(useReturnLoan).mockReturnValue(mockIdleMutation())
    vi.mocked(useMakeLoanPermanent).mockReturnValue(mockIdleMutation())
  })

  it('shows approve and reject for pending permanent transfers', () => {
    vi.mocked(useTransferDetail).mockReturnValue({
      data: pendingPermanent,
      isLoading: false,
      isError: false,
    } as never)

    renderDetail()

    expect(screen.getByRole('heading', { name: /Ana Costa/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aprovar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rejeitar/i })).toBeInTheDocument()
  })

  it('shows complete action for approved transfers', () => {
    vi.mocked(useTransferDetail).mockReturnValue({
      data: approvedTransfer,
      isLoading: false,
      isError: false,
    } as never)

    renderDetail('t-2')

    expect(screen.getByRole('button', { name: /Concluir transferência/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Aprovar$/i })).not.toBeInTheDocument()
  })

  it('calls approve mutation when Aprovar is clicked', () => {
    const approveMutate = vi.fn()
    vi.mocked(useTransferDetail).mockReturnValue({
      data: pendingPermanent,
      isLoading: false,
      isError: false,
    } as never)
    vi.mocked(useApproveTransfer).mockReturnValue({
      isPending: false,
      mutate: approveMutate,
      mutateAsync: vi.fn(),
    } as never)

    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: /Aprovar/i }))

    expect(approveMutate).toHaveBeenCalledWith('t-1')
  })
})
