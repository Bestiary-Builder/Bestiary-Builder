/// <reference types="cypress" />
context('Viewport', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('cy.viewport() - set the viewport size and dimension', () => {
    // https://on.cypress.io/viewport
    cy.viewport(1920, 1080) 

    cy.get('#navbar').should('be.visible')
    cy.get('.v-navigation-drawer').should('have.class', 'v-navigation-drawer--active')

    cy.viewport(320, 480)
    cy.wait(200)

    // the navbar should have collapse since our screen is smaller
    cy.get('.v-navigation-drawer').should('not.have.class', 'v-navigation-drawer--active')

    // the navbar should respond to opening and closing
    cy.get('.v-app-bar-nav-icon').click()
    cy.get('.v-navigation-drawer').should('have.class', 'v-navigation-drawer--active')
  })
})
