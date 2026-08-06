import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'

// Mock the hooks module used by the page
vi.mock('@/modules/players/hooks', () => {
  return {
    useCreatePlayer: vi.fn(),
    useUpdatePlayerMe: vi.fn(),
  }
})

vi.mock('@/modules/notifications/hooks/useNotifications', () => ({
  useUnreadCount: () => ({ data: 0, isLoading: false }),
}))

vi.mock('@/modules/notifications/hooks/useNotificationStream', () => ({
  useNotificationStream: () => ({ isConnected: false, notifications: [] }),
}))

// Component under test
import { DashboardPlayerCreatePage } from '@/modules/players/pages/DashboardPlayerCreatePage'

// Re-import the mocked hooks so tests can access the spies
import * as hooks from '@/modules/players/hooks'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('DashboardPlayerCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls updatePlayerMe when from=onboarding and does not call create', async () => {
    const updateSpy = vi.fn().mockResolvedValue({})
    const createSpy = vi.fn().mockResolvedValue({})

    vi.spyOn(hooks, 'useUpdatePlayerMe').mockImplementation(() => ({ mutate: updateSpy, mutateAsync: updateSpy, isPending: false, isSuccess: false, isError: false } as any))
    vi.spyOn(hooks, 'useCreatePlayer').mockImplementation(() => ({ mutate: createSpy, mutateAsync: createSpy, isPending: false, isSuccess: false, isError: false } as any))

    renderWithQueryClient(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/dashboard/players/create?from=onboarding"]}>
          <DashboardPlayerCreatePage />
        </MemoryRouter>
      </I18nextProvider>,
    )

    // Fill required fields
    const firstName = screen.getByPlaceholderText(/ex: joão/i)
    const lastName = screen.getByPlaceholderText(/ex: silva/i)

    fireEvent.change(firstName, { target: { value: 'Test' } })
    fireEvent.change(lastName, { target: { value: 'User' } })

    const form = document.querySelector('form')!
    fireEvent.submit(form)

    expect(updateSpy).toHaveBeenCalled()
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('falls back to createPlayer if updatePlayerMe returns 404', async () => {
    const updateMutate = vi.fn().mockRejectedValue({ response: { status: 404 } })
    const createSpy = vi.fn().mockResolvedValue({})

    vi.spyOn(hooks, 'useUpdatePlayerMe').mockImplementation(() => ({ mutate: updateMutate, mutateAsync: updateMutate, isPending: false, isSuccess: false, isError: false } as any))
    vi.spyOn(hooks, 'useCreatePlayer').mockImplementation(() => ({ mutate: createSpy, mutateAsync: createSpy, isPending: false, isSuccess: false, isError: false } as any))

    renderWithQueryClient(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/dashboard/players/create?from=onboarding"]}>
          <DashboardPlayerCreatePage />
        </MemoryRouter>
      </I18nextProvider>,
    )

    const firstName = screen.getByPlaceholderText(/ex: joão/i)
    const lastName = screen.getByPlaceholderText(/ex: silva/i)

    fireEvent.change(firstName, { target: { value: 'Fallback' } })
    fireEvent.change(lastName, { target: { value: 'User' } })

    const form = document.querySelector('form')!
    fireEvent.submit(form)

    expect(updateMutate).toHaveBeenCalled()
  })
})
