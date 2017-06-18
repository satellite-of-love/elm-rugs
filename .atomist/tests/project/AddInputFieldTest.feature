Feature: Add an input field


  Scenario: AddInputField should edit a project correctly
    Given a project with a certain file
    When the AddInputField is run
    Then parameters were valid
    Then changes were made
    Then that certain file looks different
