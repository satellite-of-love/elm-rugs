Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the from beginner program to advanced.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: Upgrade should edit a project correctly
    Given a beginner Elm project
    When the Upgrade is run
    Then parameters were valid
    Then changes were made
    Then we have an advanced Elm project
