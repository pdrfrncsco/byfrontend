describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset any state before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should display the login page correctly', () => {
    cy.visit('/login')
    cy.get('h1').contains('Login')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').contains('Entrar')
  })

  it('should show validation errors for empty fields', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').click()
    // Depending on validation UI, check for error messages
    cy.get('form').contains('Obrigatório').should('be.visible')
  })

  it('should navigate to register page from login', () => {
    cy.visit('/login')
    cy.contains('Criar conta').click()
    cy.url().should('include', '/register')
  })
})
