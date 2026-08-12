describe('Player Agents E2E Tests', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/players/1/agents')
  })

  describe('Agent Section Display', () => {
    it('should display active agent', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              agent: {
                id: 'agent-1',
                name: 'João Pereira',
                agency_name: 'Pereira Sports',
                agency_type: 'agency',
                email: 'joao@pereira.pt',
                phone: '+351 21 9999999',
                website: 'https://pereira-sports.pt',
                fifa_agent_id: 'FIFA123456',
                verified: true,
                country: 'PT',
              },
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              status: 'active',
              commission_rate: 5,
              notes: 'Representação exclusiva',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
            {
              id: '2',
              player: '1',
              agent: {
                id: 'agent-2',
                name: 'Maria Silva',
                agency_name: 'Silva Agency',
                agency_type: 'individual',
                email: 'maria@silva.pt',
                phone: '+351 21 8888888',
                website: null,
                fifa_agent_id: null,
                verified: false,
                country: 'PT',
              },
              start_date: '2020-01-01',
              end_date: '2022-12-31',
              status: 'expired',
              commission_rate: 3,
              notes: null,
              created_at: '2020-01-01T00:00:00Z',
              updated_at: '2020-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getAgents')

      cy.findByText(/Agente Ativo/i).should('be.visible')
      cy.wait('@getAgents')

      cy.findByText('João Pereira').should('be.visible')
      cy.findByText(/Agência de Desportos/i).should('be.visible')
      cy.findByText(/Ativo/i).should('be.visible')
    })

    it('should display agent contact information', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              agent: {
                id: 'agent-1',
                name: 'João Pereira',
                agency_name: 'Pereira Sports',
                agency_type: 'agency',
                email: 'joao@pereira.pt',
                phone: '+351 21 9999999',
                website: 'https://pereira-sports.pt',
                fifa_agent_id: 'FIFA123456',
                verified: true,
                country: 'PT',
              },
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              status: 'active',
              commission_rate: 5,
              notes: 'Representação exclusiva',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getAgents')

      cy.wait('@getAgents')

      cy.findByText(/Contacto/i).should('be.visible')
      cy.findByText('joao@pereira.pt').should('be.visible')
      cy.findByText('+351 21 9999999').should('be.visible')
    })

    it('should display agent credentials', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              agent: {
                id: 'agent-1',
                name: 'João Pereira',
                agency_name: 'Pereira Sports',
                agency_type: 'agency',
                email: 'joao@pereira.pt',
                phone: '+351 21 9999999',
                website: 'https://pereira-sports.pt',
                fifa_agent_id: 'FIFA123456',
                verified: true,
                country: 'PT',
              },
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              status: 'active',
              commission_rate: 5,
              notes: 'Representação exclusiva',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getAgents')

      cy.wait('@getAgents')

      cy.findByText(/Credenciais/i).should('be.visible')
      cy.findByText(/FIFA: FIFA123456/i).should('be.visible')
      cy.findByText(/✓ Verificado/i).should('be.visible')
    })
  })

  describe('Agent History Display', () => {
    it('should display agent relationships history', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              agent: {
                id: 'agent-1',
                name: 'João Pereira',
                agency_name: 'Pereira Sports',
                agency_type: 'agency',
                email: 'joao@pereira.pt',
                phone: '+351 21 9999999',
                website: 'https://pereira-sports.pt',
                fifa_agent_id: 'FIFA123456',
                verified: true,
                country: 'PT',
              },
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              status: 'active',
              commission_rate: 5,
              notes: 'Representação exclusiva',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
            {
              id: '2',
              player: '1',
              agent: {
                id: 'agent-2',
                name: 'Maria Silva',
                agency_name: 'Silva Agency',
                agency_type: 'individual',
                email: 'maria@silva.pt',
                phone: '+351 21 8888888',
                website: null,
                fifa_agent_id: null,
                verified: false,
                country: 'PT',
              },
              start_date: '2020-01-01',
              end_date: '2022-12-31',
              status: 'expired',
              commission_rate: 3,
              notes: null,
              created_at: '2020-01-01T00:00:00Z',
              updated_at: '2020-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getAgents')

      cy.wait('@getAgents')

      cy.findByText(/Histórico de Agentes/i).should('be.visible')
      cy.findByText('2 relacionamentos').should('be.visible')
      cy.findByText('Maria Silva').should('be.visible')
    })

    it('should display agent status', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              agent: {
                id: 'agent-1',
                name: 'João Pereira',
                agency_name: 'Pereira Sports',
                agency_type: 'agency',
                email: 'joao@pereira.pt',
                phone: '+351 21 9999999',
                website: 'https://pereira-sports.pt',
                fifa_agent_id: 'FIFA123456',
                verified: true,
                country: 'PT',
              },
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              status: 'active',
              commission_rate: 5,
              notes: 'Representação exclusiva',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
            {
              id: '2',
              player: '1',
              agent: {
                id: 'agent-2',
                name: 'Maria Silva',
                agency_name: 'Silva Agency',
                agency_type: 'individual',
                email: 'maria@silva.pt',
                phone: '+351 21 8888888',
                website: null,
                fifa_agent_id: null,
                verified: false,
                country: 'PT',
              },
              start_date: '2020-01-01',
              end_date: '2022-12-31',
              status: 'expired',
              commission_rate: 3,
              notes: null,
              created_at: '2020-01-01T00:00:00Z',
              updated_at: '2020-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getAgents')

      cy.wait('@getAgents')

      cy.findByText(/Ativo/i).should('be.visible')
      cy.findByText(/Expirado/i).should('be.visible')
    })

    it('should display commission rates', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: {
          results: [
            {
              id: '1',
              player: '1',
              agent: {
                id: 'agent-1',
                name: 'João Pereira',
                agency_name: 'Pereira Sports',
                agency_type: 'agency',
                email: 'joao@pereira.pt',
                phone: '+351 21 9999999',
                website: 'https://pereira-sports.pt',
                fifa_agent_id: 'FIFA123456',
                verified: true,
                country: 'PT',
              },
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              status: 'active',
              commission_rate: 5,
              notes: 'Representação exclusiva',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          ],
        },
      }).as('getAgents')

      cy.wait('@getAgents')

      cy.findByText(/Comissão/i).should('be.visible')
      cy.findByText(/5%/i).should('be.visible')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no agents', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 200,
        body: { results: [] },
      }).as('getAgents')

      cy.wait('@getAgents')

      cy.findByText(/Sem agentes/i).should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/v1/players/1/agents/', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('getAgentsError')

      cy.wait('@getAgentsError')

      cy.findByText(/Erro ao Carregar/i).should('be.visible')
    })
  })
})
