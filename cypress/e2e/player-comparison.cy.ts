describe('Player Comparison Tool E2E Tests', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/players/comparison')
  })

  describe('Player Selection', () => {
    it('should display player selection interface', () => {
      cy.findByText(/Selecionar Jogadores|Select Players/i).should('be.visible')
      cy.findByText(/0\/5 jogadores selecionados|0\/5 players selected/i).should('be.visible')
    })

    it('should add player to comparison', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()

      cy.wait('@getPlayer1')
      cy.findByText(/1\/5/i).should('be.visible')
    })

    it('should remove player from comparison', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      // Remove player
      cy.get('[data-testid="remove-player"]').click()
      cy.findByText(/0\/5/i).should('be.visible')
    })

    it('should prevent adding duplicate players', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      // Try to add same player again
      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()

      // Should still have only 1 player
      cy.findByText(/1\/5/i).should('be.visible')
    })

    it('should limit to 5 players maximum', () => {
      const playerIds = [1, 2, 3, 4, 5]

      playerIds.forEach((id) => {
        cy.intercept('GET', `/api/v1/players/${id}/`, {
          statusCode: 200,
          body: {
            id,
            name: `Player ${id}`,
            slug: `player-${id}`,
            position: 'ST',
            nationality: 'Angola',
            height: 185,
            weight: 78,
            date_of_birth: '1996-01-15',
            statistics: {
              goals: 45,
              assists: 12,
              matches: 89,
              minutes_played: 6000,
              pass_accuracy: 85,
              tackles: 20,
              interceptions: 5,
              clearances: 10,
              aerial_win_percentage: 65,
            },
          },
        }).as(`getPlayer${id}`)
      })

      playerIds.forEach((id) => {
        cy.get('input[placeholder*="ID"]').type(String(id))
        cy.findByRole('button', { name: /\+|Add/i }).click()
        cy.wait(`@getPlayer${id}`)
      })

      cy.findByText(/5\/5/i).should('be.visible')

      // Add button should be hidden/disabled when max reached
      cy.get('input[placeholder*="ID"]').should('not.exist')
    })
  })

  describe('Player Comparison Cards', () => {
    it('should display player info cards', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.findByText('João Silva').should('be.visible')
      cy.findByText('ST • Angola').should('be.visible')
      cy.findByText('185').should('be.visible') // Height
      cy.findByText('78').should('be.visible') // Weight
    })

    it('should display player statistics', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.findByText('45').should('be.visible') // Goals
      cy.findByText('12').should('be.visible') // Assists
      cy.findByText('89').should('be.visible') // Matches
    })

    it('should display cards side by side on desktop', () => {
      cy.viewport('macbook-15')

      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.intercept('GET', '/api/v1/players/2/', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'Pedro Costa',
          slug: 'pedro-costa',
          position: 'ST',
          nationality: 'Angola',
          height: 180,
          weight: 75,
          date_of_birth: '1999-05-20',
          statistics: {
            goals: 35,
            assists: 8,
            matches: 70,
            minutes_played: 5000,
            pass_accuracy: 82,
            tackles: 15,
            interceptions: 4,
            clearances: 8,
            aerial_win_percentage: 58,
          },
        },
      }).as('getPlayer2')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.get('input[placeholder*="ID"]').type('2')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer2')

      // Cards should be displayed side by side
      cy.get('[data-testid="player-card"]').should('have.length', 2)
      cy.get('[data-testid="player-card"]').should('have.class', 'md:flex-row')
    })
  })

  describe('Radar Chart Comparison', () => {
    it('should display radar chart for 2+ players', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.intercept('GET', '/api/v1/players/2/', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'Pedro Costa',
          slug: 'pedro-costa',
          position: 'ST',
          nationality: 'Angola',
          height: 180,
          weight: 75,
          date_of_birth: '1999-05-20',
          statistics: {
            goals: 35,
            assists: 8,
            matches: 70,
            minutes_played: 5000,
            pass_accuracy: 82,
            tackles: 15,
            interceptions: 4,
            clearances: 8,
            aerial_win_percentage: 58,
          },
        },
      }).as('getPlayer2')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.get('input[placeholder*="ID"]').type('2')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer2')

      cy.findByText(/Comparação de Desempenho|Performance Comparison/i).should('be.visible')
      cy.get('svg[class*="recharts"]').should('be.visible')
    })

    it('should not display radar chart for single player', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.findByText(/Comparação de Desempenho|Performance Comparison/i).should('not.exist')
    })
  })

  describe('Detailed Comparison', () => {
    it('should display detailed comparison for 2 players', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.intercept('GET', '/api/v1/players/2/', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'Pedro Costa',
          slug: 'pedro-costa',
          position: 'ST',
          nationality: 'Angola',
          height: 180,
          weight: 75,
          date_of_birth: '1999-05-20',
          statistics: {
            goals: 35,
            assists: 8,
            matches: 70,
            minutes_played: 5000,
            pass_accuracy: 82,
            tackles: 15,
            interceptions: 4,
            clearances: 8,
            aerial_win_percentage: 58,
          },
        },
      }).as('getPlayer2')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.get('input[placeholder*="ID"]').type('2')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer2')

      cy.findByText(/Comparação Detalhada|Detailed Comparison/i).should('be.visible')
      cy.findByText(/Idade|Age/i).should('be.visible')
      cy.findByText(/Altura|Height/i).should('be.visible')
      cy.findByText(/Golos|Goals/i).should('be.visible')
    })

    it('should show differences between players', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.intercept('GET', '/api/v1/players/2/', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'Pedro Costa',
          slug: 'pedro-costa',
          position: 'ST',
          nationality: 'Angola',
          height: 180,
          weight: 75,
          date_of_birth: '1999-05-20',
          statistics: {
            goals: 35,
            assists: 8,
            matches: 70,
            minutes_played: 5000,
            pass_accuracy: 82,
            tackles: 15,
            interceptions: 4,
            clearances: 8,
            aerial_win_percentage: 58,
          },
        },
      }).as('getPlayer2')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.get('input[placeholder*="ID"]').type('2')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer2')

      // Should show goal difference (+10)
      cy.findByText(/\+10|10/i).should('be.visible')
    })
  })

  describe('Statistics Summary', () => {
    it('should display aggregated statistics', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.intercept('GET', '/api/v1/players/2/', {
        statusCode: 200,
        body: {
          id: 2,
          name: 'Pedro Costa',
          slug: 'pedro-costa',
          position: 'ST',
          nationality: 'Angola',
          height: 180,
          weight: 75,
          date_of_birth: '1999-05-20',
          statistics: {
            goals: 35,
            assists: 8,
            matches: 70,
            minutes_played: 5000,
            pass_accuracy: 82,
            tackles: 15,
            interceptions: 4,
            clearances: 8,
            aerial_win_percentage: 58,
          },
        },
      }).as('getPlayer2')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.get('input[placeholder*="ID"]').type('2')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer2')

      cy.findByText(/Estatísticas Agregadas|Aggregated Statistics/i).should('be.visible')
      cy.findByText(/Idade Média|Average Age/i).should('be.visible')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no players selected', () => {
      cy.findByText(/Selecione jogadores|Select players/i).should('be.visible')
    })
  })

  describe('URL Persistence', () => {
    it('should persist selected players in URL', () => {
      cy.intercept('GET', '/api/v1/players/1/', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'João Silva',
          slug: 'joao-silva',
          position: 'ST',
          nationality: 'Angola',
          height: 185,
          weight: 78,
          date_of_birth: '1996-01-15',
          statistics: {
            goals: 45,
            assists: 12,
            matches: 89,
            minutes_played: 6000,
            pass_accuracy: 85,
            tackles: 20,
            interceptions: 5,
            clearances: 10,
            aerial_win_percentage: 65,
          },
        },
      }).as('getPlayer1')

      cy.get('input[placeholder*="ID"]').type('1')
      cy.findByRole('button', { name: /\+|Add/i }).click()
      cy.wait('@getPlayer1')

      cy.url().should('include', 'compare=1')
    })
  })
})
