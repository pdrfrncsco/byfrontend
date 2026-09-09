import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { OrganizationCard } from '@/modules/organizations/components/OrganizationCard'
import type { PublicOrganization } from '@/modules/organizations/types'

const mockOrg: PublicOrganization = {
  id: 'org-1',
  name: 'Federação Angolana de Futebol',
  slug: 'faf',
  type: 'federation',
  type_label: 'Federação',
  description: 'Entidade máxima do futebol angolano',
  country: 'Angola',
  city: 'Luanda',
  verified: true,
  is_verified: true,
  primary_color: '#1B4D3E',
}

describe('OrganizationCard', () => {
  it('renders organization details, verified badge and navigation link', () => {
    render(
      <MemoryRouter>
        <OrganizationCard organization={mockOrg} />
      </MemoryRouter>
    )

    expect(screen.getByText('Federação Angolana de Futebol')).toBeInTheDocument()
    expect(screen.getByText('Federação')).toBeInTheDocument()
    expect(screen.getByText('Luanda, Angola')).toBeInTheDocument()
    expect(screen.getByLabelText('Verificada')).toBeInTheDocument()
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/organizations/faf')
  })
})
