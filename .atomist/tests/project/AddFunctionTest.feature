Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the add a function to an Elm program.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: AddFunction should edit a project correctly
    Given a project with an Elm program
    When the AddFunction is run
    Then parameters were valid
    Then changes were made
    Then the Elm program has the new function

  Scenario: AddFunction should add a function to the specified section
    Given a project with an Elm program with sections
    When the AddFunction is run with section VIEW
    Then parameters were valid
    Then changes were made
    Then the Elm program has the new function in the VIEW section