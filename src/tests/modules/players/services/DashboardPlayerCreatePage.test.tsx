import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'

// Mock the hooks module used by the page (must be before importing the component)
vi.mock('@/modules/players/hooks', () => {
  return {
    useCreatePlayer: () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false }),
    useUpdatePlayerMe: () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false }),
  }
})

// Component under test
import { DashboardPlayerCreatePage } from '@/modules/players/pages/DashboardPlayerCreatePage'

// Re-import the mocked hooks so tests can access the spies
import * as hooks from '@/modules/players/hooks'

describe('DashboardPlayerCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls updatePlayerMe when from=onboarding and does not call create', async () => {
    const updateSpy = vi.fn()
    const createSpy = vi.fn()

    vi.spyOn(hooks, 'useUpdatePlayerMe').mockImplementation(() => ({ mutate: updateSpy, isPending: false, isSuccess: false, isError: false }))
    vi.spyOn(hooks, 'useCreatePlayer').mockImplementation(() => ({ mutate: createSpy, isPending: false, isSuccess: false, isError: false }))

    render(
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
    fireEvent.change(lastName, { target: { value: 'Player' } })

    // Submit form by submitting the form element (bypass disabled submit button)
    const form = document.querySelector('form')
    if (!form) throw new Error('Form not found')
    fireEvent.submit(form)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(createSpy).toHaveBeenCalledTimes(0)
  })

  it('falls back to createPlayer if updatePlayerMe returns 404', async () => {
    const createSpy = vi.fn()
    // update mutate calls onError with a 404-like shape
    const updateMutate = vi.fn((payload: any, options: any) => {
      options?.onError?.({ response: { status: 404 } })
    })

    vi.spyOn(hooks, 'useUpdatePlayerMe').mockImplementation(() => ({ mutate: updateMutate, isPending: false, isSuccess: false, isError: false }))
    vi.spyOn(hooks, 'useCreatePlayer').mockImplementation(() => ({ mutate: createSpy, isPending: false, isSuccess: false, isError: false }))

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/dashboard/players/create?from=onboarding"]}>
          <DashboardPlayerCreatePage />
        </MemoryRouter>
      </I18nextProvider>,
    )

    const firstName = screen.getByPlaceholderText(/ex: joão/i)
    const lastName = screen.getByPlaceholderText(/ex: silva/i)

    fireEvent.change(firstName, { target: { value: 'Fallback' } })
    fireEvent.change(lastName, { target: { value: 'Player' } })

    const form = document.querySelector('form')
    if (!form) throw new Error('Form not found')
    fireEvent.submit(form)

    expect(updateMutate).toHaveBeenCalledTimes(1)
    expect(createSpy).toHaveBeenCalledTimes(1)
  })
})
