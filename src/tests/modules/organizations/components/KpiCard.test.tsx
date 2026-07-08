import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '@/modules/organizations/components/KpiCard'
import { Users } from 'lucide-react'

describe('KpiCard', () => {
  it('should render label and value', () => {
    render(<KpiCard label="Total Clubes" value={24} />)

    expect(screen.getByText('Total Clubes')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('should render with string value', () => {
    render(<KpiCard label="Status" value="Activo" />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('should render icon', () => {
    render(
      <KpiCard
        label="Total Jogadores"
        value={1250}
        icon={<Users data-testid="users-icon" />}
      />
    )

    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
  })

  it('should render positive trend', () => {
    render(
      <KpiCard
        label="Crescimento"
        value="+15%"
        trend={{ value: '+5%', isPositive: true }}
      />
    )

    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('should render negative trend', () => {
    render(
      <KpiCard
        label="Decrescimento"
        value="-10%"
        trend={{ value: '-3%', isPositive: false }}
      />
    )

    expect(screen.getByText('-3%')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <KpiCard label="Test" value={100} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
