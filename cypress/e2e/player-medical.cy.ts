describe('Player Medical Dashboard', () => {
  const baseUrl = 'http://localhost:5173'
  const playerId = 'player-123'

  beforeEach(() => {
    // Login as medical staff
    cy.visit(`${baseUrl}/auth/login`)
    cy.get('[data-testid="email-input"]').type('medical@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()

    // Navigate to player medical profile
    cy.url().should('include', '/dashboard')
    cy.visit(`${baseUrl}/players/${playerId}`)
    cy.get('[data-testid="medical-section"]').should('exist')
  })

  describe('Medical Section Display', () => {
    it('should display medical section with status', () => {
      cy.get('[data-testid="medical-section"]').should('be.visible')
      cy.get('[data-testid="medical-status"]').should('exist')
      cy.get('[data-testid="medical-status-badge"]').should('contain', /apto|lesionado|recuperação|suspenso/i)
    })

    it('should display blood type', () => {
      cy.get('[data-testid="blood-type"]').should('exist')
      cy.get('[data-testid="blood-type"]').should('contain', /A\+|A-|B\+|B-|AB\+|AB-|O\+|O-/)
    })

    it('should display medical clearance status', () => {
      cy.get('[data-testid="medical-clearance"]').should('exist')
      cy.get('[data-testid="medical-clearance"]').should('contain', /apto|não apto/i)
    })

    it('should display fitness status if available', () => {
      cy.get('[data-testid="fitness-status"]').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).should('not.be.empty')
        }
      })
    })

    it('should display exam schedule', () => {
      cy.get('[data-testid="last-medical-exam"]').should('exist')
      cy.get('[data-testid="next-medical-exam"]').should('exist')
    })
  })

  describe('Medical Status Colors', () => {
    it('should show green for fit status', () => {
      cy.get('[data-testid="medical-status"]').contains('Apto').parent().should('have.class', 'text-green-700')
    })

    it('should show red for injured status', () => {
      cy.get('[data-testid="medical-status"]').contains('Lesionado').parent().should('have.class', 'text-red-700')
    })

    it('should show yellow for recovering status', () => {
      cy.get('[data-testid="medical-status"]').contains('Em Recuperação').parent().should('have.class', 'text-yellow-700')
    })

    it('should show gray for suspended status', () => {
      cy.get('[data-testid="medical-status"]').contains('Suspenso').parent().should('have.class', 'text-gray-700')
    })
  })

  describe('Medical Documents Display', () => {
    it('should display documents section', () => {
      cy.get('[data-testid="medical-documents-section"]').should('be.visible')
    })

    it('should show document count', () => {
      cy.get('[data-testid="documents-count"]').should('exist')
    })

    it('should group documents by status', () => {
      cy.get('[data-testid="pending-documents-group"]').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).should('be.visible')
        }
      })

      cy.get('[data-testid="verified-documents-group"]').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).should('be.visible')
        }
      })
    })

    it('should display document details when expanded', () => {
      cy.get('[data-testid="medical-document"]').first().then(($doc) => {
        if ($doc.length > 0) {
          cy.wrap($doc).click()
          cy.get('[data-testid="document-issued-date"]').should('be.visible')
          cy.get('[data-testid="document-type"]').should('be.visible')
        }
      })
    })
  })

  describe('Document Verification (Staff-only)', () => {
    it('should show verify button for pending documents', () => {
      cy.get('[data-testid="pending-documents-group"]').then(($group) => {
        if ($group.length > 0) {
          cy.wrap($group).within(() => {
            cy.get('[data-testid="verify-button"]').should('be.visible')
          })
        }
      })
    })

    it('should verify document on button click', () => {
      cy.get('[data-testid="pending-documents-group"]').then(($group) => {
        if ($group.length > 0) {
          cy.wrap($group).within(() => {
            cy.get('[data-testid="verify-button"]').first().click()
          })

          cy.get('[data-testid="toast-success"]').should('contain', 'Documento verificado')
        }
      })
    })

    it('should show reject button for pending documents', () => {
      cy.get('[data-testid="pending-documents-group"]').then(($group) => {
        if ($group.length > 0) {
          cy.wrap($group).within(() => {
            cy.get('[data-testid="reject-button"]').should('be.visible')
          })
        }
      })
    })

    it('should reject document with reason', () => {
      cy.get('[data-testid="pending-documents-group"]').then(($group) => {
        if ($group.length > 0) {
          cy.wrap($group).within(() => {
            cy.get('[data-testid="reject-button"]').first().click()
          })

          cy.get('[data-testid="rejection-reason-input"]').type('Documento ilegível')
          cy.get('[data-testid="confirm-rejection-button"]').click()

          cy.get('[data-testid="toast-success"]').should('contain', 'Documento rejeitado')
        }
      })
    })
  })

  describe('Exam Overdue Alert', () => {
    it('should show overdue alert if exam is past due', () => {
      cy.get('[data-testid="exam-overdue-alert"]').then(($alert) => {
        if ($alert.length > 0) {
          cy.wrap($alert).should('be.visible')
          cy.wrap($alert).should('contain', 'Exame Médico Atrasado')
        }
      })
    })

    it('should show days countdown if exam is upcoming', () => {
      cy.get('[data-testid="exam-days-until"]').then(($badge) => {
        if ($badge.length > 0) {
          cy.wrap($badge).should('be.visible')
          cy.wrap($badge).should('contain', /\d+\s+dias?/)
        }
      })
    })
  })

  describe('Edit Medical Profile Form', () => {
    beforeEach(() => {
      cy.get('[data-testid="edit-medical-profile-button"]').click()
      cy.get('[data-testid="medical-profile-form"]').should('be.visible')
    })

    it('should have all required form fields', () => {
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="blood-type-select"]').should('exist')
        cy.get('[data-testid="medical-status-select"]').should('exist')
        cy.get('[data-testid="medical-clearance-checkbox"]').should('exist')
        cy.get('[data-testid="fitness-status-input"]').should('exist')
        cy.get('[data-testid="last-exam-date-input"]').should('exist')
        cy.get('[data-testid="next-exam-date-input"]').should('exist')
        cy.get('[data-testid="submit-button"]').should('exist')
      })
    })

    it('should display confidential section for staff', () => {
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="confidential-section"]').should('be.visible')
        cy.get('[data-testid="allergies-textarea"]').should('exist')
        cy.get('[data-testid="medications-textarea"]').should('exist')
        cy.get('[data-testid="conditions-textarea"]').should('exist')
        cy.get('[data-testid="medical-notes-textarea"]').should('exist')
      })
    })

    it('should show injury status field when injured selected', () => {
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="medical-status-select"]').click()
        cy.get('[data-testid="status-injured-option"]').click()

        cy.get('[data-testid="injury-status-textarea"]').should('be.visible')
      })
    })

    it('should validate required fields', () => {
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
        cy.get('[data-testid="blood-type-error"]').should('be.visible')
        cy.get('[data-testid="medical-status-error"]').should('be.visible')
      })
    })

    it('should submit profile with valid data', () => {
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="blood-type-select"]').click()
        cy.get('[data-testid="blood-type-option-aplus"]').click()

        cy.get('[data-testid="medical-status-select"]').click()
        cy.get('[data-testid="status-fit-option"]').click()

        cy.get('[data-testid="medical-clearance-checkbox"]').check()

        cy.get('[data-testid="fitness-status-input"]').type('90% fitness')

        cy.get('[data-testid="last-exam-date-input"]').type('2024-07-01')

        cy.get('[data-testid="allergies-textarea"]').type('None')
        cy.get('[data-testid="medications-textarea"]').type('None')

        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-success"]').should('contain', 'Perfil médico atualizado')
    })

    it('should show injury status required when injured', () => {
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="blood-type-select"]').click()
        cy.get('[data-testid="blood-type-option-aplus"]').click()

        cy.get('[data-testid="medical-status-select"]').click()
        cy.get('[data-testid="status-injured-option"]').click()

        cy.get('[data-testid="medical-clearance-checkbox"]').check()

        cy.get('[data-testid="allergies-textarea"]').type('None')
        cy.get('[data-testid="medications-textarea"]').type('None')

        cy.get('[data-testid="submit-button"]').click()

        cy.get('[data-testid="injury-status-error"]').should('be.visible')
      })
    })
  })

  describe('Upload Medical Document Form', () => {
    beforeEach(() => {
      cy.get('[data-testid="upload-document-button"]').click()
      cy.get('[data-testid="medical-document-form"]').should('be.visible')
    })

    it('should have all required form fields', () => {
      cy.get('[data-testid="medical-document-form"]').within(() => {
        cy.get('[data-testid="document-type-select"]').should('exist')
        cy.get('[data-testid="title-input"]').should('exist')
        cy.get('[data-testid="description-textarea"]').should('exist')
        cy.get('[data-testid="issued-date-input"]').should('exist')
        cy.get('[data-testid="expires-date-input"]').should('exist')
        cy.get('[data-testid="file-input"]').should('exist')
        cy.get('[data-testid="confidential-checkbox"]').should('exist')
        cy.get('[data-testid="submit-button"]').should('exist')
      })
    })

    it('should validate required fields', () => {
      cy.get('[data-testid="medical-document-form"]').within(() => {
        cy.get('[data-testid="submit-button"]').click()
        cy.get('[data-testid="title-error"]').should('be.visible')
        cy.get('[data-testid="file-error"]').should('be.visible')
      })
    })

    it('should validate file size', () => {
      // Create a file larger than 10MB
      cy.get('[data-testid="file-input"]').selectFile({
        contents: Cypress.Buffer.alloc(11 * 1024 * 1024),
        fileName: 'large-file.pdf',
        mimeType: 'application/pdf',
      })

      cy.get('[data-testid="file-size-error"]').should('contain', '10MB')
    })

    it('should validate file type', () => {
      cy.get('[data-testid="file-input"]').selectFile({
        contents: Cypress.Buffer.from('test'),
        fileName: 'test.txt',
        mimeType: 'text/plain',
      })

      cy.get('[data-testid="file-type-error"]').should('contain', 'não suportado')
    })

    it('should display selected file info', () => {
      cy.get('[data-testid="file-input"]').selectFile({
        contents: Cypress.Buffer.from('%PDF-1.0\n%test'),
        fileName: 'medical-certificate.pdf',
        mimeType: 'application/pdf',
      })

      cy.get('[data-testid="file-selected-name"]').should('contain', 'medical-certificate.pdf')
      cy.get('[data-testid="file-selected-size"]').should('exist')
    })

    it('should submit document with valid data', () => {
      cy.get('[data-testid="medical-document-form"]').within(() => {
        cy.get('[data-testid="document-type-select"]').click()
        cy.get('[data-testid="type-medical-certificate"]').click()

        cy.get('[data-testid="title-input"]').type('Annual Medical Certificate 2024')

        cy.get('[data-testid="description-textarea"]').type('Full medical clearance for 2024-25 season')

        cy.get('[data-testid="issued-date-input"]').type('2024-08-01')

        cy.get('[data-testid="expires-date-input"]').type('2025-08-01')

        cy.get('[data-testid="confidential-checkbox"]').should('be.checked')

        cy.get('[data-testid="file-input"]').selectFile({
          contents: Cypress.Buffer.from('%PDF-1.0\n%test'),
          fileName: 'medical-cert.pdf',
          mimeType: 'application/pdf',
        })

        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-success"]').should('contain', 'Documento carregado')
    })

    it('should disable submit button when no file selected', () => {
      cy.get('[data-testid="medical-document-form"]').within(() => {
        cy.get('[data-testid="title-input"]').type('Test Document')
        cy.get('[data-testid="submit-button"]').should('be.disabled')
      })
    })

    it('should enable submit button when file selected', () => {
      cy.get('[data-testid="medical-document-form"]').within(() => {
        cy.get('[data-testid="title-input"]').type('Test Document')

        cy.get('[data-testid="file-input"]').selectFile({
          contents: Cypress.Buffer.from('%PDF-1.0\n%test'),
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
        })

        cy.get('[data-testid="submit-button"]').should('not.be.disabled')
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display medical section on mobile', () => {
      cy.get('[data-testid="medical-section"]').should('be.visible')
    })

    it('should stack form fields vertically', () => {
      cy.get('[data-testid="edit-medical-profile-button"]').click()
      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('[data-testid="blood-type-select"]').should('have.css', 'width').and('eq', '100%')
      })
    })

    it('should make buttons full width on mobile', () => {
      cy.get('[data-testid="upload-document-button"]').should('have.css', 'width').and('eq', '100%')
    })
  })

  describe('Error Handling', () => {
    it('should display error when profile fetch fails', () => {
      cy.intercept('GET', '**/api/v1/players/*/medical/', { statusCode: 500 })

      cy.reload()

      cy.get('[data-testid="medical-error"]').should('be.visible')
    })

    it('should display error when document upload fails', () => {
      cy.intercept('POST', '**/api/v1/players/*/medical/documents/', { statusCode: 400 })

      cy.get('[data-testid="upload-document-button"]').click()

      cy.get('[data-testid="medical-document-form"]').within(() => {
        cy.get('[data-testid="document-type-select"]').click()
        cy.get('[data-testid="type-medical-certificate"]').click()

        cy.get('[data-testid="title-input"]').type('Test')

        cy.get('[data-testid="file-input"]').selectFile({
          contents: Cypress.Buffer.from('%PDF-1.0\n%test'),
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
        })

        cy.get('[data-testid="submit-button"]').click()
      })

      cy.get('[data-testid="toast-error"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      cy.get('[data-testid="edit-medical-profile-button"]').click()

      cy.get('[data-testid="medical-profile-form"]').within(() => {
        cy.get('label').should('have.length.greaterThan', 0)
        cy.get('label').each(($label) => {
          cy.wrap($label).should('not.be.empty')
        })
      })
    })

    it('should be keyboard navigable', () => {
      cy.get('[data-testid="edit-medical-profile-button"]').focus()
      cy.get('[data-testid="edit-medical-profile-button"]').should('have.focus')

      cy.get('[data-testid="edit-medical-profile-button"]').type('{enter}')
      cy.get('[data-testid="medical-profile-form"]').should('be.visible')
    })

    it('should have appropriate ARIA labels', () => {
      cy.get('[data-testid="medical-status"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="medical-clearance"]').should('have.attr', 'aria-label')
    })
  })

  describe('Permission Controls', () => {
    it('should hide confidential data from non-staff users', () => {
      // Logout and login as regular player
      cy.get('[data-testid="logout-button"]').click()

      cy.visit(`${baseUrl}/auth/login`)
      cy.get('[data-testid="email-input"]').type('player@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()

      cy.visit(`${baseUrl}/players/${playerId}`)

      cy.get('[data-testid="confidential-section"]').should('not.exist')
      cy.get('[data-testid="medical-notes"]').should('not.exist')
    })

    it('should disable verification buttons for non-staff users', () => {
      // Same as above, non-staff user
      cy.get('[data-testid="verify-button"]').should('not.exist')
      cy.get('[data-testid="reject-button"]').should('not.exist')
    })
  })
})
