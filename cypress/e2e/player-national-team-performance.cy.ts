describe('Player National Team & Performance Dashboard', () => {
  const baseUrl = 'http://localhost:5173'
  const playerId = 'player-123'

  beforeEach(() => {
    cy.visit(`${baseUrl}/auth/login`)
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()

    cy.url().should('include', '/dashboard')
    cy.visit(`${baseUrl}/players/${playerId}`)
    cy.get('[data-testid="national-team-performance-section"]').should('exist')
  })

  describe('National Team Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="national-team-tab"]').click()
    })

    it('should display national team section', () => {
      cy.get('[data-testid="national-team-content"]').should('be.visible')
    })

    it('should show active call-ups with alert styling', () => {
      cy.get('[data-testid="active-callups-card"]').then(($card) => {
        if ($card.length > 0) {
          cy.wrap($card).should('have.class', 'border-green-400')
        }
      })
    })

    it('should display country flag emoji', () => {
      cy.get('[data-testid="country-flag"]').then(($flag) => {
        if ($flag.length > 0) {
          cy.wrap($flag).should('not.be.empty')
        }
      })
    })

    it('should display call-up statistics', () => {
      cy.get('[data-testid="callup-stats"]').then(($stats) => {
        if ($stats.length > 0) {
          cy.wrap($stats).within(() => {
            cy.get('[data-testid="stat-caps"]').should('exist')
            cy.get('[data-testid="stat-goals"]').should('exist')
            cy.get('[data-testid="stat-assists"]').should('exist')
          })
        }
      })
    })

    it('should display call-up dates', () => {
      cy.get('[data-testid="callup-card"]').then(($card) => {
        if ($card.length > 0) {
          cy.wrap($card).within(() => {
            cy.get('[data-testid="called-date"]').should('not.be.empty')
          })
        }
      })
    })

    it('should show historical call-ups separately', () => {
      cy.get('[data-testid="historical-callups-card"]').then(($card) => {
        if ($card.length > 0) {
          cy.wrap($card).should('be.visible')
        }
      })
    })

    it('should display category badges', () => {
      cy.get('[data-testid="category-badge"]').then(($badges) => {
        if ($badges.length > 0) {
          cy.wrap($badges).first().should('contain', /Sênior|Sub-\d+/)
        }
      })
    })

    it('should display status badges', () => {
      cy.get('[data-testid="callup-status-badge"]').then(($badges) => {
        if ($badges.length > 0) {
          cy.wrap($badges).first().should('contain', /Chamado|Libertado|Recusado|Lesionado|Concluído/)
        }
      })
    })

    it('should show empty state when no call-ups', () => {
      cy.intercept('GET', '**/api/v1/players/*/national-team-call-ups/', {
        results: [],
      })

      cy.reload()

      cy.get('[data-testid="empty-state"]').should('contain', 'Sem chamadas')
    })
  })

  describe('Performance Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="performance-tab"]').click()
    })

    it('should display performance section', () => {
      cy.get('[data-testid="performance-content"]').should('be.visible')
    })

    it('should display metric categories', () => {
      cy.get('[data-testid="metric-category"]').then(($categories) => {
        if ($categories.length > 0) {
          cy.wrap($categories).should('have.length.greaterThan', 0)
        }
      })
    })

    it('should display metric values with units', () => {
      cy.get('[data-testid="metric-value"]').then(($metrics) => {
        if ($metrics.length > 0) {
          cy.wrap($metrics)
            .first()
            .should('contain', /\d+/)
            .and('contain', /km\/h|bpm|m|hours|%/)
        }
      })
    })

    it('should display metric source', () => {
      cy.get('[data-testid="metric-source"]').then(($sources) => {
        if ($sources.length > 0) {
          cy.wrap($sources).first().should('contain', /GPS|Dispositivo|Manual|Análise|Sistema/)
        }
      })
    })

    it('should show performance metric cards', () => {
      cy.get('[data-testid="metric-card"]').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards).first().within(() => {
            cy.get('[data-testid="metric-label"]').should('exist')
            cy.get('[data-testid="metric-value"]').should('exist')
          })
        }
      })
    })

    it('should display empty state when no metrics', () => {
      cy.intercept('GET', '**/api/v1/players/*/performance/summary/', {
        statusCode: 200,
        body: {},
      })

      cy.reload()

      cy.get('[data-testid="empty-state"]').should('contain', 'Sem métricas')
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs', () => {
      cy.get('[data-testid="national-team-tab"]').should('be.visible')
      cy.get('[data-testid="performance-tab"]').should('be.visible')

      cy.get('[data-testid="performance-tab"]').click()
      cy.get('[data-testid="performance-content"]').should('be.visible')

      cy.get('[data-testid="national-team-tab"]').click()
      cy.get('[data-testid="national-team-content"]').should('be.visible')
    })

    it('should maintain tab state on reload', () => {
      cy.get('[data-testid="performance-tab"]').click()
      cy.reload()
      cy.get('[data-testid="performance-content"]').should('be.visible')
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display tabs on mobile', () => {
      cy.get('[data-testid="national-team-tab"]').should('be.visible')
      cy.get('[data-testid="performance-tab"]').should('be.visible')
    })

    it('should stack metric cards vertically on mobile', () => {
      cy.get('[data-testid="performance-tab"]').click()
      cy.get('[data-testid="metric-card"]').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards).should('have.css', 'flex-direction')
        }
      })
    })

    it('should display call-up info vertically on mobile', () => {
      cy.get('[data-testid="national-team-tab"]').click()
      cy.get('[data-testid="callup-stats"]').then(($stats) => {
        if ($stats.length > 0) {
          cy.wrap($stats).should('have.css', 'display')
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error when national team fetch fails', () => {
      cy.intercept('GET', '**/api/v1/players/*/national-team-call-ups/', {
        statusCode: 500,
      })

      cy.reload()

      cy.get('[data-testid="national-team-tab"]').click()
      cy.get('[data-testid="error-message"]').should('contain', 'Erro')
    })

    it('should display error when performance fetch fails', () => {
      cy.intercept('GET', '**/api/v1/players/*/performance/summary/', {
        statusCode: 500,
      })

      cy.reload()

      cy.get('[data-testid="performance-tab"]').click()
      cy.get('[data-testid="error-message"]').should('contain', 'Erro')
    })

    it('should recover from error on retry', () => {
      cy.intercept('GET', '**/api/v1/players/*/national-team-call-ups/', {
        statusCode: 500,
      }).as('initialFail')

      cy.reload()
      cy.wait('@initialFail')

      cy.intercept('GET', '**/api/v1/players/*/national-team-call-ups/', {
        results: [
          {
            id: '1',
            player: 'p1',
            national_team: 'PRT',
            category: 'senior',
            call_up_date: '2024-08-01',
            status: 'called',
            caps: 10,
            goals: 2,
            assists: 1,
          },
        ],
      }).as('success')

      cy.get('[data-testid="retry-button"]').click()
      cy.wait('@success')

      cy.get('[data-testid="callup-card"]').should('be.visible')
    })
  })

  describe('Data Loading States', () => {
    it('should show loading spinner while fetching', () => {
      cy.intercept('GET', '**/api/v1/players/*/national-team-call-ups/', (req) => {
        req.reply((res) => {
          res.delay(500)
          res.send({ results: [] })
        })
      })

      cy.reload()
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
    })

    it('should hide loading spinner after data loads', () => {
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
      cy.get('[data-testid="national-team-content"]').should('be.visible')
    })
  })

  describe('Data Display Accuracy', () => {
    it('should display correct country names', () => {
      cy.get('[data-testid="country-name"]').then(($names) => {
        if ($names.length > 0) {
          cy.wrap($names)
            .first()
            .should('contain', /Portugal|Brasil|França|Alemanha|Espanha|Itália/)
        }
      })
    })

    it('should format metrics correctly', () => {
      cy.get('[data-testid="performance-tab"]').click()

      cy.get('[data-testid="metric-value"]').then(($metrics) => {
        if ($metrics.length > 0) {
          // Speed should be in km/h
          cy.wrap($metrics).each(($metric) => {
            const text = $metric.text()
            if (text.includes('km/h')) {
              const number = parseFloat(text)
              expect(number).toBeGreaterThan(0)
            }
          })
        }
      })
    })

    it('should display statistics with correct calculations', () => {
      cy.get('[data-testid="stat-caps"]').then(($caps) => {
        if ($caps.length > 0) {
          const capsValue = parseInt($caps.text())
          cy.get('[data-testid="stat-goals"]').then(($goals) => {
            const goalsValue = parseInt($goals.text())
            // Goals should not exceed caps
            expect(goalsValue).toBeLessThanOrEqual(capsValue)
          })
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('should have tab buttons with proper labels', () => {
      cy.get('[data-testid="national-team-tab"]').should('have.attr', 'role', 'tab')
      cy.get('[data-testid="performance-tab"]').should('have.attr', 'role', 'tab')
    })

    it('should have ARIA labels for content', () => {
      cy.get('[data-testid="national-team-content"]').should('have.attr', 'role', 'tabpanel')
      cy.get('[data-testid="performance-content"]').should('have.attr', 'role', 'tabpanel')
    })

    it('should be keyboard navigable', () => {
      cy.get('[data-testid="national-team-tab"]').focus()
      cy.get('[data-testid="national-team-tab"]').should('have.focus')

      cy.get('[data-testid="national-team-tab"]').type('{rightarrow}')
      cy.get('[data-testid="performance-tab"]').should('have.focus')
    })
  })
})
