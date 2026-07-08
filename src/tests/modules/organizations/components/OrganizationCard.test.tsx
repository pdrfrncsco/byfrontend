import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { OrganizationCard } from '@/modules/organizations/components/OrganizationCard'
import { mockPublicOrganization } from '@/tests/__mocks__/organization.mock'

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('OrganizationCard', () => {
  it('should render organization name', () => {
    renderWithRouter(<OrganizationCard organization={mockPublicOrganization} />)

    expect(screen.getByText(mockPublicOrganization.name)).toBeInTheDocument()
  })

  it('should render organization type_label as badge', () => {
    renderWithRouter(<OrganizationCard organization={mockPublicOrganization} />)

    // O componente usa type_label se disponível, senão usa type
    expect(screen.getByText('Federação')).toBeInTheDocument()
  })

  it('should render logo when available', () => {
    renderWithRouter(<OrganizationCard organization={mockPublicOrganization} />)

    const logo = screen.getByAltText(`${mockPublicOrganization.name} logo`)
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', mockPublicOrganization.logo_url)
  })

  it('should render fallback letter when no logo', () => {
    const orgWithoutLogo = { ...mockPublicOrganization, logo_url: null }
    renderWithRouter(<OrganizationCard organization={orgWithoutLogo} />)

    expect(screen.getByText('F')).toBeInTheDocument() // First letter of "Federação"
  })

  it('should render subscriber count', () => {
    renderWithRouter(<OrganizationCard organization={mockPublicOrganization} />)

    expect(screen.getByText(/subscritores/i)).toBeInTheDocument()
  })

  it('should link to organization detail page', () => {
    renderWithRouter(<OrganizationCard organization={mockPublicOrganization} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/organizations/${mockPublicOrganization.slug}`)
  })

  it('should apply custom className', () => {
    const { container } = renderWithRouter(
      <OrganizationCard organization={mockPublicOrganization} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should display location', () => {
    renderWithRouter(<OrganizationCard organization={mockPublicOrganization} />)

    // Usa getAllByText para lidar com múltiplas ocorrências de "Angola"
    const angolaElements = screen.getAllByText(/Angola/)
    expect(angolaElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/Luanda/)).toBeInTheDocument()
  })
})
