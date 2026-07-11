import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { competitionRoutes } from '@/modules/competitions/routes'
import { CompetitionCreatePage } from '@/modules/competitions/pages/CompetitionCreatePage'
import { CompetitionSettingsPage } from '@/modules/competitions/pages/CompetitionSettingsPage'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('@/modules/competitions/hooks/useCompetitions', () => ({
  useCreateCompetition: vi.fn(),
  useCompetition: vi.fn(),
  useUpdateCompetition: vi.fn(),
}))

vi.mock('@/modules/competitions/components/CompetitionHeader', () => ({
  CompetitionHeaderSkeleton: () => <div>Loading competition header</div>,
}))

import {
  useCreateCompetition,
  useCompetition,
  useUpdateCompetition,
} from '@/modules/competitions/hooks/useCompetitions'

function renderCreatePage() {
  return render(
    <MemoryRouter initialEntries={['/competitions/create']}>
      <Routes>
        <Route path="/competitions/create" element={<CompetitionCreatePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderSettingsPage() {
  return render(
    <MemoryRouter initialEntries={['/competitions/comp-2/settings']}>
      <Routes>
        <Route path="/competitions/:id/settings" element={<CompetitionSettingsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('competition management pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a competition and redirects to the detail page', async () => {
    const navigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(navigate)

    const mutate = vi.fn((_data, options) => {
      options?.onSuccess?.({ id: 'comp-1' })
    })

    vi.mocked(useCreateCompetition).mockReturnValue({
      mutate,
      isPending: false,
    } as never)

    renderCreatePage()

    fireEvent.change(screen.getByPlaceholderText(/ex: liga nacional sub-20/i), {
      target: { value: 'Liga Nacional Sub-20' },
    })
    fireEvent.change(screen.getByLabelText(/tipo de competição/i), {
      target: { value: 'cup' },
    })
    fireEvent.change(screen.getByPlaceholderText(/ex: 2025-2026/i), {
      target: { value: '2025-2026' },
    })

    fireEvent.click(screen.getByRole('button', { name: /criar competição/i }))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Liga Nacional Sub-20',
          competition_type: 'cup',
          season: '2025-2026',
        }),
        expect.any(Object),
      )
      expect(navigate).toHaveBeenCalledWith(competitionRoutes.detail('comp-1'))
    })
  })

  it('updates competition settings after editing the form', async () => {
    const mutate = vi.fn()

    vi.mocked(useCompetition).mockReturnValue({
      data: {
        id: 'comp-2',
        name: 'Liga Nacional',
        competition_type: 'league',
        season: '2024-2025',
        status: 'active',
      },
      isLoading: false,
    } as never)

    vi.mocked(useUpdateCompetition).mockReturnValue({
      mutate,
      isPending: false,
    } as never)

    renderSettingsPage()

    fireEvent.change(screen.getByPlaceholderText(/nome da competição/i), {
      target: { value: 'Liga Nacional Atualizada' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar alterações/i }))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        id: 'comp-2',
        data: expect.objectContaining({
          name: 'Liga Nacional Atualizada',
          competition_type: 'league',
          season: '2024-2025',
          status: 'active',
        }),
      })
    })
  })
})
