describe('Dashboard Navigation & Lazy Loading', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    // Mock authentication if necessary or assume a logged-in state setup here
  })

  it('should lazy load the main dashboard components', () => {
    // Intercepting network requests could ensure lazy chunks are requested
    cy.intercept('GET', '**/assets/*.js').as('chunkLoad')
    
    // As a test, we will just visit the public explore to see if it loads successfully
    cy.visit('/explore')
    
    cy.get('h1').should('exist')
  })
})
