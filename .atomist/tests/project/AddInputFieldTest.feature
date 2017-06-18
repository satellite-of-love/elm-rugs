Feature: Add an input field


  Scenario: AddInputField should edit a project correctly
    Given a beginner Elm project with no input field
    When the AddInputField is run
    Then parameters were valid
    Then changes were made
    Then the input field has been added
