Feature: Using telegram bot for controlling detection process

  Scenario: Getting detections
    Given User has telegram bot
    When User starts motion detecting by program
    And Some motion occurs for time more than threshold
    And Program DOES detect motion
    And User HAS notification of detections

  Scenario: Stopping detections
    Given User has telegram bot
    When User starts motion detecting by program
    And Some motion occurs for time more than threshold
    When Program DOES detect motion
    And User HAS notification of detections
    And User stops motion detecting by telegram
    And Some motion occurs for time more than threshold
    Then Program DOESN'T detect motion
    And User HASN'T notification of detections