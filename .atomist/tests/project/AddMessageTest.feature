Feature: Manipulate the messages
  Understand and add to the messages sent around in an Elm program.

 Scenario: AddMessages should edit a project correctly
    Given an Elm program with only NoOp
    When AddMessage is run
    Then parameters were valid
    Then changes were made
    Then the field is in the Msg type
    Then the field is in the update switch

 Scenario: AddMessages should edit a project with stuff in it
    Given an Elm program with a message
    When AddMessage is run
    Then parameters were valid
    Then changes were made
    Then the field is in the Msg type
    Then the field is in the update switch

Scenario: we can understand more messages
  Given an Elm program with 2 messages
  Then we can detect 2 messages

 Scenario: we can understand messages
  Given an Elm program with a message
  Then we can detect a message

  
