Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the add a field to the model.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: AddToModel should edit a project correctly
    Given an Elm program with an empty model
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
  