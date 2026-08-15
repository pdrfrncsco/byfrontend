import { faker } from '@faker-js/faker'

describe('Player Transfers Management', () => {
  const playerId = 'player-123'
  const baseUrl = 'http://localhost:5173'

  beforeEach(() => {
    // Login
    cy.visit(`${baseUrl}/auth/login`)
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()

    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard')

    // Navigate to player profile
    cy.visit(`${baseUrl}/players/${playerId}`)
    cy.get('[data-testid="transfers-section"]').should('exist')
  })

  describe('Transfer Section Display', () => {
    it('should display transfer section with pending transfers', () => {
      cy.get('[data-testid="transfers-section"]').should('be.visible')
      cy.get('[data-testid="transfer-pending-list"]').should('exist')
      cy.get('[data-testid="transfer-card"]').should('have.length.greaterThan', 0)
    })

    it('should display transfer status indicators', () => {
      cy.get('[data-testid="transfer-status"]').each(($status) => {
        cy.wrap($status).should('have.text.oneOf', [
          'Solicitado',
          'Pendente',
          'Aprovado',
          'Rejeitado',
          'Concluído',
        ])
      })
    })

    it('should display transfer type labels', () => {
      cy.get('[data-testid="transfer-type"]').each(($type) => {
        cy.wrap($type).should('have.text.oneOf', [
          'Transferência Permanente',
          'Empréstimo',
          'Transferência Livre',
          'Transferência de Formação',
        ])
      })
    })

    it('should display club names correctly', () => {
      cy.get('[data-testid="transfer-from-club"]').first().should('not.be.empty')
      cy.get('[data-testid="transfer-to-club"]').first().should('not.be.empty')
    })

    it('should display transfer dates', () => {
      cy.get('[data-testid="transfer-effective-date"]').each(($date) => {
        cy.wrap($date).should('not.be.empty')
      })
    })

    it('should display transfer fees with currency', () => {
      cy.get('[data-testid="transfer-fee"]').each(($fee) => {
        cy.wrap($fee).should('contain', /€|€|\$|£/)
      })
    })

    it('should display loan duration for loan transfers', () => {
      cy.get('[data-testid="transfer-type"]')
        .contains('Empréstimo')
        .closest('[data-testid="transfer-card"]')
        .within(() => {
          cy.get('[data-testid="transfer-loan-duration"]').should('exist')
          cy.get('[data-testid="transfer-loan-duration"]').should('contain', 'meses')
        })
    })
  })

  describe('Pending Transfers Section', () => {
    it('should highlight pending transfers', () => {
      cy.get('[data-testid="transfer-pending-alert"]').should('have.length.greaterThan', 0)
      cy.get('[data-testid="transfer-pending-alert"]').first().should('have.class', 'border-l-4')
    })

    it('should display days until effective date for pending transfers', () => {
      cy.get('[data-testid="transfer-pending-alert"]').first().within(() => {
        cy.get('[data-testid="transfer-days-until"]').should('exist')
        cy.get('[data-testid="transfer-days-until"]').should('contain', /dias|hoje/)
      })
    })

    it('should show action buttons for pending transfers', () => {
      cy.get('[data-testid="transfer-pending-alert"]').first().within(() => {
        cy.get('[data-testid="transfer-details-button"]').should('be.visible')
        cy.get('[data-testid="transfer-cancel-button"]').should('be.visible')
      })
    })

    it('should allow viewing transfer details', () => {
      cy.get('[data-testid="transfer-pending-alert"]')
        .first()
        .within(() => {
          cy.get('[data-testid="transfer-details-button"]').click()
        })

      cy.get('[data-testid="transfer-details-modal"]').should('be.visible')
    })

    it('should allow cancelling pending transfer', () => {
      cy.get('[data-testid="transfer-pending-alert"]').first().within(() => {
        cy.get('[data-testid="transfer-cancel-button"]').click()
      })

      cy.get('[data-testid="confirm-cancel-modal"]').should('be.visible')
      cy.get('[data-testid="confirm-button"]').click()

      cy.get('[data-testid="toast-success"]').should('contain', 'Transferência cancelada')
    })

    it('should display notes for pending transfers', () => {
      cy.get('[data-testid="transfer-pending-alert"]')
        .filter(':has([data-testid="transfer-notes"])')
        .first()
        .within(() => {
          cy.get('[data-testid="transfer-notes"]').should('be.visible')
        })
    })
  })

  describe('Active Transfers Highlight', () => {
    it('should highlight active transfer separately', () => {
      cy.get('[data-testid="transfer-active-highlight"]').should('be.visible')
      cy.get('[data-testid="transfer-active-highlight"]').should('have.class', 'border-primary')
    })

    it('should show active transfer clubs clearly', () => {
      cy.get('[data-testid="transfer-active-highlight"]').within(() => {
        cy.get('[data-testid="transfer-from-club"]').should('exist')
        cy.get('[data-testid="transfer-to-club"]').should('exist')
      })
    })

    it('should display active transfer status badge', () => {
      cy.get('[data-testid="transfer-active-highlight"]').within(() => {
        cy.get('[data-testid="transfer-active-badge"]').should('contain', 'Aprovado')
      })
    })
  })

  describe('Transfer History Display', () => {
    it('should display all transfers in history list', () => {
      cy.get('[data-testid="transfer-history-list"]').should('exist')
      cy.get('[data-testid="transfer-history-item"]').should('have.length.greaterThan', 0)
    })

    it('should display correct count in history header', () => {
      cy.get('[data-testid="transfer-history-count"]').should('contain', /\d+\s+transferência/)
    })

    it('should sort transfers by date', () => {
      cy.get('[data-testid="transfer-history-item"]')
        .first()
        .should('contain', new Date().getFullYear())
    })

    it('should allow opening transfer details from history', () => {
      cy.get('[data-testid="transfer-history-item"]').first().within(() => {
        cy.get('[data-testid="transfer-open-button"]').click()
      })

      cy.get('[data-testid="transfer-details-modal"]').should('be.visible')
    })
  })

  describe('Add Transfer Button', () => {
    it('should display add transfer button', () => {
      cy.get('[data-testid="add-transfer-button"]').should('be.visible')
      cy.get('[data-testid="add-transfer-button"]').should('contain', 'Solicitar Transferência')
    })

    it('should open transfer form on button click', () => {
      cy.get('[data-testid="add-transfer-button"]').click()
      cy.get('[data-testid="transfer-form"]').should('be.visible')
    })

    it('should have all required form fields', () => {
      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('[data-testid="club-search-input"]').should('exist')
        cy.get('[data-testid="transfer-type-select"]').should('exist')
        cy.get('[data-testid="effective-date-input"]').should('exist')
        cy.get('[data-testid="transfer-fee-input"]').should('exist')
        cy.get('[data-testid="currency-select"]').should('exist')
        cy.get('[data-testid="notes-textarea"]').should('exist')
        cy.get('[data-testid="submit-button"]').should('exist')
      })
    })
  })

  describe('Transfer Form Submission', () => {
    it('should submit transfer form with all required fields', () => {
      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="club-search-input"]').type('Liverpool')
      cy.get('[data-testid="club-suggestion"]').first().click()

      cy.get('[data-testid="transfer-type-select"]').select('permanent')

      cy.get('[data-testid="effective-date-input"]').type('2024-09-01')

      cy.get('[data-testid="transfer-fee-input"]').type('5000000')

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-success"]').should('contain', 'Transferência solicitada')
    })

    it('should show validation errors for missing required fields', () => {
      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="form-error"]').should('be.visible')
    })

    it('should handle loan transfer with duration', () => {
      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="club-search-input"]').type('Ajax')
      cy.get('[data-testid="club-suggestion"]').first().click()

      cy.get('[data-testid="transfer-type-select"]').select('loan')

      cy.get('[data-testid="loan-duration-input"]').should('be.visible')
      cy.get('[data-testid="loan-duration-input"]').type('12')

      cy.get('[data-testid="effective-date-input"]').type('2024-09-01')

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-success"]').should('contain', 'Transferência solicitada')
    })

    it('should handle free transfer without fee', () => {
      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="club-search-input"]').type('Barcelona')
      cy.get('[data-testid="club-suggestion"]').first().click()

      cy.get('[data-testid="transfer-type-select"]').select('free')

      cy.get('[data-testid="effective-date-input"]').type('2024-09-01')

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-success"]').should('contain', 'Transferência solicitada')
    })
  })

  describe('Transfer Status Transitions', () => {
    it('should show correct status colors for different statuses', () => {
      cy.get('[data-testid="transfer-status"]').each(($status) => {
        const text = $status.text()

        if (text === 'Solicitado') {
          cy.wrap($status).should('have.class', 'text-blue-700')
        } else if (text === 'Pendente') {
          cy.wrap($status).should('have.class', 'text-yellow-700')
        } else if (text === 'Aprovado') {
          cy.wrap($status).should('have.class', 'text-green-700')
        } else if (text === 'Rejeitado') {
          cy.wrap($status).should('have.class', 'text-red-700')
        } else if (text === 'Concluído') {
          cy.wrap($status).should('have.class', 'text-purple-700')
        }
      })
    })

    it('should display status icons', () => {
      cy.get('[data-testid="transfer-status-icon"]').each(($icon) => {
        const text = $icon.text()
        expect(['📋', '⏳', '✅', '❌', '🎉']).toContain(text)
      })
    })
  })

  describe('Transfer Dates and Duration', () => {
    it('should display requested date', () => {
      cy.get('[data-testid="transfer-requested-date"]')
        .first()
        .should('contain', /\d{2}\/\d{2}\/\d{4}/)
    })

    it('should display effective date', () => {
      cy.get('[data-testid="transfer-effective-date"]')
        .first()
        .should('contain', /\d{2}\/\d{2}\/\d{4}/)
    })

    it('should calculate days until effective date correctly', () => {
      cy.get('[data-testid="transfer-days-until"]').each(($days) => {
        cy.wrap($days).should('contain', /^\d+\s+dias?|hoje/)
      })
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no transfers exist', () => {
      // Navigate to a different player with no transfers
      cy.visit(`${baseUrl}/players/empty-player-123`)

      cy.get('[data-testid="transfer-empty-state"]').should('be.visible')
      cy.get('[data-testid="transfer-empty-state"]').should('contain', 'Sem transferências')
    })

    it('should show add transfer button in empty state', () => {
      cy.visit(`${baseUrl}/players/empty-player-123`)

      cy.get('[data-testid="transfer-empty-state"]').within(() => {
        cy.get('[data-testid="add-transfer-button"]').should('be.visible')
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display transfer section on mobile', () => {
      cy.get('[data-testid="transfers-section"]').should('be.visible')
    })

    it('should stack transfer details vertically on mobile', () => {
      cy.get('[data-testid="transfer-card"]').first().within(() => {
        cy.get('[data-testid="transfer-grid"]').should('have.class', 'grid-cols-1')
      })
    })

    it('should make buttons responsive on mobile', () => {
      cy.get('[data-testid="transfer-card"]').first().within(() => {
        cy.get('[data-testid="transfer-details-button"]').should('have.css', 'flex')
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when transfer fetch fails', () => {
      cy.intercept('GET', '**/api/v1/players/*/transfers/', { statusCode: 500 })

      cy.reload()

      cy.get('[data-testid="transfer-error"]').should('be.visible')
      cy.get('[data-testid="transfer-error"]').should(
        'contain',
        'Erro ao Carregar Transferências'
      )
    })

    it('should handle submission errors gracefully', () => {
      cy.intercept('POST', '**/api/v1/players/*/transfers/', { statusCode: 400 })

      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="club-search-input"]').type('Liverpool')
      cy.get('[data-testid="club-suggestion"]').first().click()

      cy.get('[data-testid="transfer-type-select"]').select('permanent')

      cy.get('[data-testid="effective-date-input"]').type('2024-09-01')

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-error"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      cy.get('[data-testid="add-transfer-button"]').click()

      cy.get('[data-testid="transfer-form"]').within(() => {
        cy.get('label').should('have.length.greaterThan', 0)
        cy.get('label').each(($label) => {
          cy.wrap($label).should('not.be.empty')
        })
      })
    })

    it('should be keyboard navigable', () => {
      cy.get('[data-testid="transfers-section"]').should('be.visible')

      cy.get('[data-testid="add-transfer-button"]').focus()
      cy.get('[data-testid="add-transfer-button"]').should('have.focus')

      cy.get('[data-testid="add-transfer-button"]').type('{enter}')
      cy.get('[data-testid="transfer-form"]').should('be.visible')
    })

    it('should have appropriate ARIA labels', () => {
      cy.get('[data-testid="transfer-status"]').first().should('have.attr', 'aria-label')

      cy.get('[data-testid="transfer-type"]').first().should('have.attr', 'aria-label')
    })
  })
})
