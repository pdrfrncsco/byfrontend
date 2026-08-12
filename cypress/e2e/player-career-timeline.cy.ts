describe('Player Career Timeline E2E Tests', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/players')
  })

  describe('Timeline Display', () => {
    it('should display career timeline with entries', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
            {
              id: 2,
              club: 'Sporting CP',
              club_slug: 'sporting-cp',
              joined: '2023-07-01',
              left: null,
              goals: 8,
              assists: 2,
              matches: 15,
              status: 'active',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerTimeline')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerTimeline')

      // Verify first entry
      cy.findByText('SL Benfica').should('be.visible')
      cy.findByText('transferred').should('be.visible')
      cy.findByText('45').should('be.visible') // goals
      cy.findByText('12').should('be.visible') // assists

      // Verify second entry
      cy.findByText('Sporting CP').should('be.visible')
      cy.findByText('active').should('be.visible')
    })

    it('should display timeline entries in chronological order', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'Club A',
              club_slug: 'club-a',
              joined: '2018-01-01',
              left: '2020-12-31',
              goals: 20,
              assists: 5,
              matches: 40,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
            {
              id: 2,
              club: 'Club B',
              club_slug: 'club-b',
              joined: '2021-01-01',
              left: '2022-12-31',
              goals: 15,
              assists: 3,
              matches: 30,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerOrder')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerOrder')

      // Get all club names in order
      cy.get('[data-testid="timeline-club"]').then(($clubs) => {
        expect($clubs[0]).to.contain('Club A')
        expect($clubs[1]).to.contain('Club B')
      })
    })

    it('should show "present" for ongoing career', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'Current Club',
              club_slug: 'current-club',
              joined: '2023-01-01',
              left: null,
              goals: 5,
              assists: 1,
              matches: 10,
              status: 'active',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getActiveCareer')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getActiveCareer')

      cy.findByText(/present|atual/i).should('be.visible')
    })
  })

  describe('Hover Interactions', () => {
    it('should show tooltip on hover over dot', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Taça de Portugal',
            },
          ],
        },
      }).as('getCareerWithCompetition')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerWithCompetition')

      cy.get('[data-testid="timeline-dot"]').first().trigger('mouseenter')
      cy.findByText('Taça de Portugal').should('be.visible')
    })

    it('should highlight entry on hover', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerHighlight')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerHighlight')

      cy.get('[data-testid="timeline-entry"]').first().trigger('mouseenter')
      // Should have hover styling applied
      cy.get('[data-testid="timeline-entry"]').first().should('have.class', 'hover:scale-105')
    })
  })

  describe('Status Badges', () => {
    it('should display correct color for each status', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'Benfica',
              club_slug: 'benfica',
              joined: '2020-01-01',
              left: '2021-12-31',
              goals: 10,
              assists: 2,
              matches: 20,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
            {
              id: 2,
              club: 'Porto',
              club_slug: 'porto',
              joined: '2022-01-01',
              left: '2023-06-30',
              goals: 8,
              assists: 1,
              matches: 15,
              status: 'loaned',
              competition: 'Primeira Liga',
            },
            {
              id: 3,
              club: 'Sporting',
              club_slug: 'sporting',
              joined: '2023-07-01',
              left: null,
              goals: 5,
              assists: 1,
              matches: 10,
              status: 'active',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerStatuses')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerStatuses')

      cy.findByText('transferred').should('have.class', 'bg-blue-100')
      cy.findByText('loaned').should('have.class', 'bg-orange-100')
      cy.findByText('active').should('have.class', 'bg-green-100')
    })
  })

  describe('Performance Metrics', () => {
    it('should display goals per match ratio', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 40,
              assists: 12,
              matches: 80, // 0.5 goals per match
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerMetrics')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerMetrics')

      cy.findByText(/0.50 g\/j|0.50 g\/m/i).should('be.visible')
    })

    it('should display statistics footer with totals', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'Club A',
              club_slug: 'club-a',
              joined: '2020-01-01',
              left: '2021-12-31',
              goals: 20,
              assists: 5,
              matches: 40,
              status: 'transferred',
              competition: 'Liga',
            },
            {
              id: 2,
              club: 'Club B',
              club_slug: 'club-b',
              joined: '2022-01-01',
              left: '2023-12-31',
              goals: 15,
              assists: 3,
              matches: 30,
              status: 'transferred',
              competition: 'Liga',
            },
          ],
        },
      }).as('getCareerFooter')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerFooter')

      // Footer should show totals
      cy.findByTestId('stats-footer').should('contain', '2') // 2 clubs
      cy.findByTestId('stats-footer').should('contain', '35') // 20 + 15 goals
      cy.findByTestId('stats-footer').should('contain', '8') // 5 + 3 assists
    })
  })

  describe('Large Dataset Handling', () => {
    it('should handle many career entries with pagination', () => {
      const careerEntries = Array.from({ length: 60 }, (_, i) => ({
        id: i + 1,
        club: `Club ${i}`,
        club_slug: `club-${i}`,
        joined: `${2000 + Math.floor(i / 5)}-01-01`,
        left: i < 59 ? `${2000 + Math.floor(i / 5) + 2}-01-01` : null,
        goals: 10 + i % 5,
        assists: 2 + i % 3,
        matches: 20 + i % 10,
        status: i === 59 ? 'active' : 'transferred',
        competition: 'Primeira Liga',
      }))

      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: { results: careerEntries },
      }).as('getCareerLarge')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerLarge')

      // Should show "Show more" button
      cy.findByText(/Ver mais|Show more/i).should('be.visible')

      // Click show more
      cy.findByText(/Ver mais|Show more/i).click()

      // Should now show all entries
      cy.findByText('Club 59').should('be.visible')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should display timeline vertically on mobile', () => {
      cy.viewport('iphone-12')

      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerMobile')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerMobile')

      // Should stack vertically
      cy.get('[data-testid="timeline-entry"]').should('have.class', 'flex')
    })

    it('should handle date formatting on mobile', () => {
      cy.viewport('iphone-12')

      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-06-15',
              left: '2023-07-20',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerDatesMobile')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerDatesMobile')

      // Date should be displayed
      cy.findByText(/15\/06\/2020|06\/15\/2020/).should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerA11y')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerA11y')

      // Should have links
      cy.get('a').should('have.attr', 'href')
    })

    it('should support keyboard navigation', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              club: 'SL Benfica',
              club_slug: 'sl-benfica',
              joined: '2020-07-01',
              left: '2023-06-30',
              goals: 45,
              assists: 12,
              matches: 89,
              status: 'transferred',
              competition: 'Primeira Liga',
            },
          ],
        },
      }).as('getCareerKeyboard')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerKeyboard')

      // Club link should be keyboard accessible
      cy.get('a:contains("SL Benfica")').should('be.focused').then(($el) => {
        expect($el.attr('tabindex')).not.to.equal('-1')
      })
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no career entries', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 200,
        body: { results: [] },
      }).as('getEmptyCareer')

      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getEmptyCareer')

      cy.findByText(/empty|sem carreira/i).should('be.visible')
    })

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/v1/players/me/career/*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('getCareerError')

      // Should display error handling UI
      cy.findByTestId('career-timeline').should('exist')
      cy.wait('@getCareerError')

      cy.findByText(/erro|error/i, { timeout: 5000 }).should('exist')
    })
  })
})
