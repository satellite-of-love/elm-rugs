Feature: the onEnter event is useful

  Scenario: OnEnter should edit a project correctly
    Given a beginner Elm project
    When the OnEnter is run
    Then parameters were valid
    Then changes were made
    Then we have a beginner program that can get a message on Enter
