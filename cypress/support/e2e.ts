// Cypress E2E Support File
// This file is loaded before running E2E tests

// Disable uncaught exception handler to ignore expected errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver loop limit exceeded errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  // Return true to continue with the error, false to ignore
  return true
})

// Add custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('fillProfileForm', (data: any) => {
  if (data.first_name) {
    cy.get('input[id="first_name"]').type(data.first_name)
  }
  if (data.last_name) {
    cy.get('input[id="last_name"]').type(data.last_name)
  }
  if (data.date_of_birth) {
    cy.get('input[id="date_of_birth"]').type(data.date_of_birth)
  }
  if (data.nationality) {
    cy.get('input[id="nationality"]').type(data.nationality)
  }
  if (data.phone) {
    cy.get('input[id="phone"]').type(data.phone)
  }
})

Cypress.Commands.add('fillFootballForm', (data: any) => {
  if (data.primary_position) {
    cy.get('select[id="primary_position"]').select(data.primary_position)
  }
  if (data.foot) {
    cy.get('select[id="foot"]').select(data.foot)
  }
})

// Type declaration for custom commands
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>
    logout(): Chainable<void>
    fillProfileForm(data: any): Chainable<void>
    fillFootballForm(data: any): Chainable<void>
  }
}

export {}
