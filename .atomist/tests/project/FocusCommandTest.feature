Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the supply a command to set the focus on a field.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: FocusCommand should edit a project correctly
    Given a project with a certain file
    When the FocusCommand is run
    Then parameters were valid
    Then changes were made
    Then that certain file looks different
