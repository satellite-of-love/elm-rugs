Feature: Add an input field


  Scenario: AddTextInput should edit a project correctly
    Given a beginner Elm project
    When the AddTextInput is run
    Then parameters were valid
    Then changes were made
    Then the input field has been added
