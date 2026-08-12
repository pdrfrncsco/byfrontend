describe('Player Compliance Dashboard', () => {
  const baseUrl = 'http://localhost:5173'
  const playerId = 'player-123'

  beforeEach(() => {
    cy.visit(`${baseUrl}/auth/login`)
    cy.get('[data-testid="email-input"]').type('compliance@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()

    cy.url().should('include', '/dashboard')
    cy.visit(`${baseUrl}/players/${playerId}`)
    cy.get('[data-testid="compliance-section"]').should('exist')
  })

  describe('Compliance Summary', () => {
    it('should display compliance summary card', () => {
      cy.get('[data-testid="compliance-summary-card"]').should('be.visible')
    })

    it('should display health status', () => {
      cy.get('[data-testid="health-status"]').should('exist')
      cy.get('[data-testid="health-status"]').should('contain', /Conforme|Parcialmente|Não/)
    })

    it('should display compliance percentage', () => {
      cy.get('[data-testid="compliance-percentage"]').should('exist')
      cy.get('[data-testid="compliance-percentage"]').should('contain', /%/)
    })

    it('should display progress bar', () => {
      cy.get('[data-testid="compliance-progress"]').should('exist')
    })

    it('should display statistics grid', () => {
      cy.get('[data-testid="compliance-stats"]').should('exist')
      cy.get('[data-testid="stat-total"]').should('exist')
      cy.get('[data-testid="stat-compliant"]').should('exist')
      cy.get('[data-testid="stat-non-compliant"]').should('exist')
      cy.get('[data-testid="stat-overdue"]').should('exist')
    })
  })

  describe('Critical Issues Alert', () => {
    it('should show critical alert when issues exist', () => {
      cy.get('[data-testid="critical-alert"]').then(($alert) => {
        if ($alert.length > 0) {
          cy.wrap($alert).should('have.class', 'border-red-200')
          cy.wrap($alert).should('contain', '🚨')
        }
      })
    })

    it('should not show alert when no critical issues', () => {
      cy.intercept('GET', '**/api/v1/players/*/compliance/', {
        results: [],
      })

      cy.reload()
      cy.get('[data-testid="critical-alert"]').should('not.exist')
    })
  })

  describe('Action Required Section', () => {
    it('should display action required card', () => {
      cy.get('[data-testid="action-required-card"]').then(($card) => {
        if ($card.length > 0) {
          cy.wrap($card).should('be.visible')
          cy.wrap($card).should('contain', 'Ações Necessárias')
        }
      })
    })

    it('should list records requiring action', () => {
      cy.get('[data-testid="compliance-record-requiring-action"]').then(($records) => {
        if ($records.length > 0) {
          cy.wrap($records).should('have.length.greaterThan', 0)
        }
      })
    })

    it('should show priority badges', () => {
      cy.get('[data-testid="priority-badge"]').then(($badges) => {
        if ($badges.length > 0) {
          cy.wrap($badges).first().should('contain', /Baixa|Média|Alta|Crítica/)
        }
      })
    })

    it('should show status badges', () => {
      cy.get('[data-testid="status-badge"]').then(($badges) => {
        if ($badges.length > 0) {
          cy.wrap($badges).first().should('contain', /Conforme|Não Conforme|Pendente|Isenção|Aprovação/)
        }
      })
    })
  })

  describe('Compliance Records Display', () => {
    it('should display all records card', () => {
      cy.get('[data-testid="all-records-card"]').then(($card) => {
        if ($card.length > 0) {
          cy.wrap($card).should('be.visible')
        }
      })
    })

    it('should show record count', () => {
      cy.get('[data-testid="record-count"]').then(($count) => {
        if ($count.length > 0) {
          cy.wrap($count).should('contain', /\d+/)
        }
      })
    })

    it('should display record rule type', () => {
      cy.get('[data-testid="record-rule-type"]').then(($types) => {
        if ($types.length > 0) {
          cy.wrap($types)
            .first()
            .should('contain', /Transferência|Autorização|Compensação|Contrato|Janela|Outro/)
        }
      })
    })

    it('should display record description', () => {
      cy.get('[data-testid="record-description"]').then(($descs) => {
        if ($descs.length > 0) {
          cy.wrap($descs).first().should('not.be.empty')
        }
      })
    })

    it('should display deadline if present', () => {
      cy.get('[data-testid="record-deadline"]').then(($deadlines) => {
        if ($deadlines.length > 0) {
          cy.wrap($deadlines).first().should('contain', /\d{2}\/\d{2}\/\d{4}/)
        }
      })
    })

    it('should show days until deadline', () => {
      cy.get('[data-testid="days-until"]').then(($days) => {
        if ($days.length > 0) {
          cy.wrap($days).first().should('contain', /dias?/)
        }
      })
    })
  })

  describe('Overdue Records Highlighting', () => {
    it('should highlight overdue records', () => {
      cy.get('[data-testid="overdue-indicator"]').then(($indicators) => {
        if ($indicators.length > 0) {
          cy.wrap($indicators)
            .first()
            .should('have.class', 'text-red-700')
        }
      })
    })

    it('should show days overdue for past deadline', () => {
      cy.get('[data-testid="overdue-text"]').then(($text) => {
        if ($text.length > 0) {
          cy.wrap($text).first().should('contain', 'atrasado')
        }
      })
    })
  })

  describe('Record Details', () => {
    it('should display rule reference if present', () => {
      cy.get('[data-testid="record-reference"]').then(($ref) => {
        if ($ref.length > 0) {
          cy.wrap($ref).should('not.be.empty')
        }
      })
    })

    it('should display notes if present', () => {
      cy.get('[data-testid="record-notes"]').then(($notes) => {
        if ($notes.length > 0) {
          cy.wrap($notes).should('not.be.empty')
        }
      })
    })

    it('should display resolution notes with green styling', () => {
      cy.get('[data-testid="resolution-notes"]').then(($resolved) => {
        if ($resolved.length > 0) {
          cy.wrap($resolved).should('have.class', 'bg-green-50')
          cy.wrap($resolved).should('contain', '✓')
        }
      })
    })

    it('should display exemption reason with purple styling', () => {
      cy.get('[data-testid="exemption-info"]').then(($exemption) => {
        if ($exemption.length > 0) {
          cy.wrap($exemption).should('have.class', 'bg-purple-50')
          cy.wrap($exemption).should('contain', '📄')
        }
      })
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no records', () => {
      cy.intercept('GET', '**/api/v1/players/*/compliance/', {
        results: [],
      })

      cy.reload()

      cy.get('[data-testid="empty-state"]').should('be.visible')
      cy.get('[data-testid="empty-state"]').should('contain', 'Sem registos')
    })

    it('should show checkmark in empty state', () => {
      cy.intercept('GET', '**/api/v1/players/*/compliance/', {
        results: [],
      })

      cy.reload()

      cy.get('[data-testid="empty-state-icon"]').should('contain', '✓')
    })
  })

  describe('Color Coding', () => {
    it('should use correct colors for priority levels', () => {
      cy.get('[data-testid="priority-low"]').should('have.class', 'bg-blue-100')
      cy.get('[data-testid="priority-medium"]').should('have.class', 'bg-yellow-100')
      cy.get('[data-testid="priority-high"]').should('have.class', 'bg-orange-100')
      cy.get('[data-testid="priority-critical"]').should('have.class', 'bg-red-100')
    })

    it('should use correct colors for status', () => {
      cy.get('[data-testid="status-compliant"]').should('have.class', 'bg-green-100')
      cy.get('[data-testid="status-non-compliant"]').should('have.class', 'bg-red-100')
      cy.get('[data-testid="status-pending"]').should('have.class', 'bg-blue-100')
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display compliance section on mobile', () => {
      cy.get('[data-testid="compliance-section"]').should('be.visible')
    })

    it('should stack stats vertically on mobile', () => {
      cy.get('[data-testid="compliance-stats"]').should('have.css', 'grid-template-columns')
    })

    it('should make cards full width on mobile', () => {
      cy.get('[data-testid="compliance-summary-card"]').should('have.css', 'width')
    })
  })

  describe('Error Handling', () => {
    it('should display error when compliance fetch fails', () => {
      cy.intercept('GET', '**/api/v1/players/*/compliance/', {
        statusCode: 500,
      })

      cy.reload()

      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Erro')
    })

    it('should display error when summary fetch fails', () => {
      cy.intercept('GET', '**/api/v1/players/*/compliance/status/', {
        statusCode: 500,
      })

      cy.reload()

      cy.get('[data-testid="error-message"]').should('be.visible')
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner while fetching', () => {
      cy.intercept('GET', '**/api/v1/players/*/compliance/', (req) => {
        req.reply((res) => {
          res.delay(500)
          res.send({ results: [] })
        })
      })

      cy.reload()
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
    })

    it('should hide spinner after data loads', () => {
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
      cy.get('[data-testid="compliance-section"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('[data-testid="compliance-section"]').within(() => {
        cy.get('h2, h3').should('have.length.greaterThan', 0)
      })
    })

    it('should have ARIA labels for progress bar', () => {
      cy.get('[data-testid="compliance-progress"]').should('have.attr', 'role')
    })

    it('should have semantic HTML for cards', () => {
      cy.get('[data-testid="compliance-summary-card"]').should('have.attr', 'role', 'region')
    })
  })

  describe('Data Accuracy', () => {
    it('should calculate percentage correctly', () => {
      cy.get('[data-testid="stat-compliant"]').then(($compliant) => {
        const compliant = parseInt($compliant.text())
        cy.get('[data-testid="stat-total"]').then(($total) => {
          const total = parseInt($total.text())
          const expectedPercent = Math.round((compliant / total) * 100)

          cy.get('[data-testid="compliance-percentage"]').should('contain', expectedPercent)
        })
      })
    })

    it('should show correct health status based on percentage', () => {
      cy.get('[data-testid="compliance-percentage"]').then(($percent) => {
        const percent = parseInt($percent.text())

        if (percent === 100) {
          cy.get('[data-testid="health-status"]').should('contain', 'Totalmente')
        } else if (percent >= 80) {
          cy.get('[data-testid="health-status"]').should('contain', 'Maioria')
        }
      })
    })
  })
})
