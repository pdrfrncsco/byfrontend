describe('Player Contracts E2E Tests', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/players/1/contracts')
  })

  describe('Contract Section Display', () => {
    it('should display active contract highlighted', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: {
                id: 'club-1',
                name: 'SL Benfica',
                slug: 'sl-benfica',
              },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: true,
              option_year: true,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
            {
              id: '2',
              player: '1',
              club: {
                id: 'club-2',
                name: 'Porto',
                slug: 'porto',
              },
              contract_type: 'professional',
              status: 'expired',
              start_date: '2020-07-01',
              end_date: '2023-06-30',
              salary: 300000,
              currency: 'EUR',
              release_clause: 30000000,
              has_image_rights: false,
              option_year: false,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2020-06-01T00:00:00Z',
              updated_at: '2020-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.findByText(/Contrato Atual/i).should('be.visible')
      cy.wait('@getContracts')

      cy.findByText('SL Benfica').should('be.visible')
      cy.findByText(/Profissional/i).should('be.visible')
      cy.findByText(/Ativo/i).should('be.visible')
    })

    it('should display contract history', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: {
                id: 'club-1',
                name: 'SL Benfica',
                slug: 'sl-benfica',
              },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: true,
              option_year: true,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
            {
              id: '2',
              player: '1',
              club: {
                id: 'club-2',
                name: 'Porto',
                slug: 'porto',
              },
              contract_type: 'professional',
              status: 'expired',
              start_date: '2020-07-01',
              end_date: '2023-06-30',
              salary: 300000,
              currency: 'EUR',
              release_clause: 30000000,
              has_image_rights: false,
              option_year: false,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2020-06-01T00:00:00Z',
              updated_at: '2020-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Histórico de Contratos/i).should('be.visible')
      cy.findByText('2 contratos').should('be.visible')
      cy.findByText('Porto').should('be.visible')
    })

    it('should show expiring soon alert', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 60)

      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: {
                id: 'club-1',
                name: 'SL Benfica',
                slug: 'sl-benfica',
              },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: futureDate.toISOString().split('T')[0],
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: true,
              option_year: true,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')
      cy.findByText(/Expira em breve/i).should('be.visible')
    })
  })

  describe('Contract Status Display', () => {
    it('should display different contract statuses', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: { id: 'club-1', name: 'Club A', slug: 'club-a' },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: false,
              option_year: false,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
            {
              id: '2',
              player: '1',
              club: { id: 'club-2', name: 'Club B', slug: 'club-b' },
              contract_type: 'professional',
              status: 'expired',
              start_date: '2020-07-01',
              end_date: '2023-06-30',
              salary: 300000,
              currency: 'EUR',
              release_clause: 30000000,
              has_image_rights: false,
              option_year: false,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2020-06-01T00:00:00Z',
              updated_at: '2020-06-01T00:00:00Z',
            },
            {
              id: '3',
              player: '1',
              club: { id: 'club-3', name: 'Club C', slug: 'club-c' },
              contract_type: 'trial',
              status: 'draft',
              start_date: '2024-01-01',
              end_date: '2024-02-01',
              salary: null,
              currency: 'EUR',
              release_clause: null,
              has_image_rights: false,
              option_year: false,
              signed_by_player: false,
              signed_by_club: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Ativo/i).should('be.visible')
      cy.findByText(/Expirado/i).should('be.visible')
      cy.findByText(/Rascunho/i).should('be.visible')
    })
  })

  describe('Signature Status', () => {
    it('should show signature status', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: { id: 'club-1', name: 'SL Benfica', slug: 'sl-benfica' },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: true,
              option_year: true,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Estado de Assinatura|Signature Status/i).should('be.visible')
      cy.findByText(/✓ Assinado|✓ Signed/i).should('exist')
    })

    it('should show pending signatures', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: { id: 'club-1', name: 'SL Benfica', slug: 'sl-benfica' },
              contract_type: 'professional',
              status: 'draft',
              start_date: '2024-01-01',
              end_date: '2025-12-31',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: true,
              option_year: true,
              signed_by_player: false,
              signed_by_club: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Pendente de Assinatura|Pending Signature/i).should('be.visible')
    })
  })

  describe('Contract Financial Info', () => {
    it('should display salary and currency', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: { id: 'club-1', name: 'SL Benfica', slug: 'sl-benfica' },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: false,
              option_year: false,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Salário/i).should('be.visible')
      cy.findByText(/por ano|per year/i).should('be.visible')
    })

    it('should display release clause', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: { id: 'club-1', name: 'SL Benfica', slug: 'sl-benfica' },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: false,
              option_year: false,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Rescisão|Release Clause/i).should('be.visible')
    })
  })

  describe('Contract Clauses Display', () => {
    it('should display special clauses', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              club: { id: 'club-1', name: 'SL Benfica', slug: 'sl-benfica' },
              contract_type: 'professional',
              status: 'active',
              start_date: '2023-07-01',
              end_date: '2027-06-30',
              salary: 500000,
              currency: 'EUR',
              release_clause: 50000000,
              has_image_rights: true,
              option_year: true,
              signed_by_player: true,
              signed_by_club: true,
              created_at: '2023-06-01T00:00:00Z',
              updated_at: '2023-06-01T00:00:00Z',
            },
          ],
        },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Cláusulas/i).should('be.visible')
      cy.findByText(/Direitos de Imagem|Image Rights/i).should('be.visible')
      cy.findByText(/Opção de Renovação|Renewal Option/i).should('be.visible')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no contracts', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 200,
        body: { results: [] },
      }).as('getContracts')

      cy.wait('@getContracts')

      cy.findByText(/Sem contratos|No contracts/i).should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/v1/players/1/contracts/', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('getContractsError')

      cy.wait('@getContractsError')

      cy.findByText(/Erro ao Carregar|Error Loading/i).should('be.visible')
    })
  })
})
