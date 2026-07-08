import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClubMembersList } from '@/modules/clubs/components/ClubMembersList'
import { mockClubMembers } from '@/tests/__mocks__/club.mock'

describe('ClubMembersList', () => {
  it('renders members with status badges', () => {
    render(<ClubMembersList members={mockClubMembers} />)

    expect(screen.getByText('João Pedro')).toBeInTheDocument()
    expect(screen.getByText(/Treinador/)).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })
})
