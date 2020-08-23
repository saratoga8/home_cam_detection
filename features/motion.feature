Feature: Motion detecting by program

  Scenario: User starts motions detecting
    When User starts motion detecting by program
    And Some motion occurs for time more than threshold
    Then Program DOES detect motion

  Scenario: User stops motion detecting
    When User stops motion detecting by program
    And Some motion occurs for some time less than threshold
    Then Program DOESN'T detect motion

  Scenario:  User increase detection threshold
    When User increases detection threshold
    And User starts motion detecting by program
    And Some motion occurs for some time less than threshold
    Then Program DOESN'T detect motion
    When Some motion occurs for time more than threshold
    Then Program DOES detect motion

  Scenario: Detection periods don't depend on each other
    When User starts motion detecting by program
    And Some motion occurs for some time less than threshold
    And Some motion occurs for some time less than threshold
    Then Program DOES detect motion