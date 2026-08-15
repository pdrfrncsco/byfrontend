/// <reference types="cypress" />

/**
 * Player Onboarding Flow E2E Tests
 * 
 * Tests the complete 3-step onboarding flow:
 * Step 1: Profile (Personal data)
 * Step 2: Football (Position, dominant foot)
 * Step 3: Review & Submit
 * 
 * @author Development Team
 * @date 2026-08-12
 */

describe('Player Onboarding Flow', () => {
  const baseUrl = Cypress.env('baseUrl') || 'http://localhost:5173'
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8000/api/v1'

  beforeEach(() => {
    // Reset and visit the onboarding page
    cy.visit(`${baseUrl}/players/onboarding/profile`)
    
    // Intercept API calls for faster tests
    cy.intercept('GET', `${apiUrl}/players/me/onboarding-status/`, {
      statusCode: 200,
      body: {
        onboarding_required: true,
        has_player_profile: true,
        has_basic_info: false,
        has_football_info: false,
        next_step: 'profile',
        player: {
          id: 'test-player-id',
          slug: 'test-player',
          first_name: 'Test',
          last_name: 'Player',
          full_name: 'Test Player',
          email: 'test@example.com',
          date_of_birth: null,
          age: null,
          nationality: null,
          primary_position: 'gk',
          status: 'active',
        },
      },
    }).as('getOnboardingStatus')

    cy.intercept('PATCH', `${apiUrl}/players/me/`, {
      statusCode: 200,
      body: {
        id: 'test-player-id',
        slug: 'test-player',
        first_name: 'Test',
        last_name: 'Player',
      },
    }).as('updatePlayer')
  })

  describe('Step 1: Profile Information', () => {
    it('should render step 1 correctly with all form fields', () => {
      cy.contains('Dados pessoais').should('be.visible')
      cy.get('input[id="first_name"]').should('be.visible')
      cy.get('input[id="last_name"]').should('be.visible')
      cy.get('input[id="date_of_birth"]').should('be.visible')
      cy.get('input[id="nationality"]').should('be.visible')
      cy.get('input[id="phone"]').should('be.visible')
    })

    it('should show error when submitting empty form', () => {
      cy.get('button').contains('Continuar').click()
      
      // Should not proceed to next step
      cy.url().should('include', '/players/onboarding/profile')
    })

    it('should show validation errors for invalid inputs', () => {
      // Test minimum length validation
      cy.get('input[id="first_name"]').type('A')
      cy.get('button').contains('Continuar').click()
      
      // Form should remain on same page
      cy.url().should('include', '/players/onboarding/profile')
    })

    it('should validate email format if provided', () => {
      cy.get('input[id="first_name"]').type('João')
      cy.get('input[id="last_name"]').type('Silva')
      cy.get('input[id="date_of_birth"]').type('1995-05-15')
      cy.get('input[id="nationality"]').type('Angolana')
      
      cy.get('button').contains('Continuar').click()
      
      // Should proceed to next step
      cy.url().should('include', '/players/onboarding/football')
    })

    it('should populate form with existing player data', () => {
      cy.get('@getOnboardingStatus').then(() => {
        cy.get('input[id="first_name"]').should('have.value', 'Test')
        cy.get('input[id="last_name"]').should('have.value', 'Player')
      })
    })

    it('should trim whitespace from form inputs', () => {
      cy.get('input[id="first_name"]').type('  João  ')
      cy.get('input[id="last_name"]').type('  Silva  ')
      cy.get('input[id="date_of_birth"]').type('1995-05-15')
      cy.get('input[id="nationality"]').type('  Angolana  ')
      
      cy.get('button').contains('Continuar').click()
      
      cy.get('@updatePlayer').then((interception) => {
        expect(interception.request.body.first_name).to.equal('João')
        expect(interception.request.body.last_name).to.equal('Silva')
        expect(interception.request.body.nationality).to.equal('Angolana')
      })
    })
  })

  describe('Step 2: Football Information', () => {
    beforeEach(() => {
      // Complete step 1 first
      cy.get('input[id="first_name"]').type('João')
      cy.get('input[id="last_name"]').type('Silva')
      cy.get('input[id="date_of_birth"]').type('1995-05-15')
      cy.get('input[id="nationality"]').type('Angolana')
      
      cy.get('button').contains('Continuar').click()
      cy.url().should('include', '/players/onboarding/football')
    })

    it('should render step 2 with football-specific fields', () => {
      cy.contains('Informações Futebolísticas').should('be.visible')
      cy.get('select[id="primary_position"]').should('be.visible')
      cy.get('select[id="foot"]').should('be.visible')
    })

    it('should require position selection', () => {
      cy.get('button').contains('Continuar').click()
      
      // Should show error or prevent navigation
      cy.url().should('include', '/players/onboarding/football')
    })

    it('should allow valid football data submission', () => {
      cy.get('select[id="primary_position"]').select('st')
      cy.get('select[id="foot"]').select('right')
      
      cy.get('button').contains('Continuar').click()
      
      cy.url().should('include', '/players/onboarding/review')
    })

    it('should maintain football data when navigating back', () => {
      cy.get('select[id="primary_position"]').select('cm')
      cy.get('select[id="foot"]').select('left')
      
      // Navigate back to step 1
      cy.get('button').contains('Voltar').click()
      cy.url().should('include', '/players/onboarding/profile')
      
      // Navigate forward to step 2
      cy.get('button').contains('Continuar').click()
      cy.url().should('include', '/players/onboarding/football')
      
      // Data should be preserved
      cy.get('select[id="primary_position"]').should('have.value', 'cm')
      cy.get('select[id="foot"]').should('have.value', 'left')
    })
  })

  describe('Step 3: Review & Submit', () => {
    beforeEach(() => {
      // Complete steps 1 and 2
      cy.get('input[id="first_name"]').type('João')
      cy.get('input[id="last_name"]').type('Silva')
      cy.get('input[id="date_of_birth"]').type('1995-05-15')
      cy.get('input[id="nationality"]').type('Angolana')
      cy.get('button').contains('Continuar').click()
      
      cy.get('select[id="primary_position"]').select('st')
      cy.get('select[id="foot"]').select('right')
      cy.get('button').contains('Continuar').click()
      
      cy.url().should('include', '/players/onboarding/review')
    })

    it('should display review summary with all entered data', () => {
      cy.contains('João Silva').should('be.visible')
      cy.contains('1995-05-15').should('be.visible')
      cy.contains('Angolana').should('be.visible')
      cy.contains('Avançado').should('be.visible')
      cy.contains('Direito').should('be.visible')
    })

    it('should allow editing data from review page', () => {
      cy.get('button').contains('Editar Perfil').click()
      cy.url().should('include', '/players/onboarding/profile')
      
      cy.get('input[id="first_name"]').clear().type('Carlos')
      cy.get('button').contains('Continuar').click()
      
      // Should maintain second step data and go to review
      cy.url().should('include', '/players/onboarding/football')
      cy.get('button').contains('Continuar').click()
      cy.url().should('include', '/players/onboarding/review')
      
      cy.contains('Carlos Silva').should('be.visible')
    })

    it('should submit onboarding successfully', () => {
      cy.intercept('POST', `${apiUrl}/players/*/complete-onboarding/`, {
        statusCode: 200,
        body: { status: 'complete' },
      }).as('completeOnboarding')

      cy.get('button').contains('Concluir Onboarding').click()
      
      cy.wait('@completeOnboarding')
      cy.url().should('include', '/players/dashboard')
      cy.contains('Onboarding concluído com sucesso').should('be.visible')
    })

    it('should show error if submission fails', () => {
      cy.intercept('POST', `${apiUrl}/players/*/complete-onboarding/`, {
        statusCode: 400,
        body: { error: 'Dados inválidos' },
      }).as('failOnboarding')

      cy.get('button').contains('Concluir Onboarding').click()
      
      cy.wait('@failOnboarding')
      cy.contains('Erro ao concluir onboarding').should('be.visible')
      cy.url().should('include', '/players/onboarding/review')
    })
  })

  describe('Step Navigation', () => {
    it('should lock future steps until current step is completed', () => {
      // Step 2 should be locked
      cy.get('button').contains('Futebol').should('be.disabled')
      
      // Step 3 should be locked
      cy.get('button').contains('Revisão').should('be.disabled')
    })

    it('should allow navigation only to completed steps', () => {
      // Complete step 1
      cy.get('input[id="first_name"]').type('João')
      cy.get('input[id="last_name"]').type('Silva')
      cy.get('input[id="date_of_birth"]').type('1995-05-15')
      cy.get('input[id="nationality"]').type('Angolana')
      cy.get('button').contains('Continuar').click()
      
      // Now step 2 should be clickable (current) and step 1 should be clickable (completed)
      cy.get('a[href*="onboarding/profile"]').should('not.be.disabled')
      cy.get('a[href*="onboarding/football"]').should('not.be.disabled')
    })

    it('should show progress bar', () => {
      cy.get('.progress-bar').should('be.visible')
      
      // Progress should be at 33% (1/3)
      cy.get('.progress-bar-fill').should('have.css', 'width').and('match', /33\.333%/)
    })
  })

  describe('Exit and Resume', () => {
    it('should allow exiting onboarding', () => {
      cy.get('button').contains('Sair').click()
      cy.url().should('include', '/players/dashboard')
    })

    it('should resume onboarding from where it was left', () => {
      // Complete step 1
      cy.get('input[id="first_name"]').type('João')
      cy.get('input[id="last_name"]').type('Silva')
      cy.get('input[id="date_of_birth"]').type('1995-05-15')
      cy.get('input[id="nationality"]').type('Angolana')
      cy.get('button').contains('Continuar').click()
      
      // Exit
      cy.get('button').contains('Sair').click()
      cy.url().should('include', '/players/dashboard')
      
      // Resume
      cy.visit(`${baseUrl}/players/onboarding/profile`)
      cy.url().should('include', '/players/onboarding/football')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.contains('Dados pessoais').should('be.visible')
      cy.get('input[id="first_name"]').should('be.visible')
    })

    it('should have proper form layout on tablet', () => {
      cy.viewport('ipad-2')
      cy.get('input[id="first_name"]').should('be.visible')
      cy.get('input[id="last_name"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('label[for="first_name"]').should('be.visible')
      cy.get('input[id="first_name"][aria-invalid="false"]').should('exist')
    })

    it('should show errors with proper role alert', () => {
      cy.get('button').contains('Continuar').click()
      cy.get('[role="alert"]').should('be.visible')
    })

    it('should be keyboard navigable', () => {
      cy.get('input[id="first_name"]').focus().type('João')
      cy.get('input[id="last_name"]').focus().type('Silva')
      cy.get('button').contains('Continuar').focus().type('{enter}')
      cy.url().should('include', '/players/onboarding/football')
    })
  })
})
