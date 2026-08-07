import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as hooks from '../hooks';
import { PlayerDashboardSettingsPage } from './PlayerDashboardSettingsPage';

// Mock hooks used by the page
vi.spyOn(hooks, 'useCurrentPlayer').mockReturnValue({ data: null, isLoading: false } as any);
vi.spyOn(hooks, 'useUpdatePlayerIdentity').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);
vi.spyOn(hooks, 'useUpdatePlayerContact').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);
vi.spyOn(hooks, 'useUpdatePlayerFootball').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);
vi.spyOn(hooks, 'useUpdatePlayerAgent').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);
vi.spyOn(hooks, 'useUpdatePlayerSocial').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);
vi.spyOn(hooks, 'useUpdatePlayerAvailability').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);
vi.spyOn(hooks, 'useUpdatePlayerPrivacy').mockReturnValue({ isPending: false, mutate: vi.fn() } as any);

describe('PlayerDashboardSettingsPage', () => {
  it('renders header and sections navigation', () => {
    render(<PlayerDashboardSettingsPage />);
    expect(screen.getByText(/Player Profile & Settings/i)).toBeDefined();
  });
});
