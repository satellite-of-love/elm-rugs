Feature: Upgrade to Beginner Program


  Scenario: UpgradeToBeginnerProgram should edit a project correctly
    Given an empty project
    When running the StaticPage generator
    When adding a function that returns Html Never
    When the UpgradeToBeginnerProgram is run
    Then the type of main is Program Never Model Msg
    Then the type of that function is Html Msg

  Scenario: UpgradeToBeginnerProgram should include all functions
    Given a project with a static program that defines something before main
    When the UpgradeToBeginnerProgram is run
    Then the type of main is Program Never Model Msg
    Then the function defined before main is included in the output
