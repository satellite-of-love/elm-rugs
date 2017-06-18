Feature: Subscribe to clicks


  Scenario: SubscribeToClicks should edit a project correctly
    Given an advanced Elm project
    When the SubscribeToClicks is run
    Then parameters were valid
    Then changes were made
    Then there is a dependency on elm-lang/mouse
    Then Mouse is imported
    Then lastClick is in the model, initialized to Nothing
    Then there is a Click message
    Then we subscribe to clicks
