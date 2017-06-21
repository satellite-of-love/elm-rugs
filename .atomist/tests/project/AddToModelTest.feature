Feature: Manipulate Elm model
  Parse and add fields to Elm model


  Scenario: AddToModel should edit a project correctly
    Given an Elm program with an empty model
    When the AddToModel is run
    Then parameters were valid
    Then changes were made
    Then the field is in the initial model
    Then the field is in the model's type

  Scenario: AddToModel should edit a project with stuff in it
    Given an Elm program with a field in the model
    When the AddToModel is run
    Then parameters were valid
    Then changes were made
    Then the field is in the initial model
    Then the field is in the model's type

  Scenario: we can understand model fields
    Given an Elm program with a field in the model
    Then we can detect a model field

  Scenario: we can understand model fields
    Given an Elm program with 2 fields in the model
    Then we can detect 2 model fields

#  Scenario: we can add when there is an inner record
#    Given an Elm program with 2 fields in the model
#    When the AddToModel is run
#    Then the third field is there
#    Then it looks like this three fields
  