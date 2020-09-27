@wip
Feature: Using telegram bot for controlling detection process

  Scenario: Getting detections
    Given User has telegram bot
    When User starts program with io TELEGRAM
    And There are detections with number more than threshold
    And Program DOES detect motion
    And User HAS notification of detections

  Scenario: Stopping detections
    Given User has telegram bot
    When User starts program with io TELEGRAM
    And There are detections with number more than threshold
    When Program DOES detect motion
    And User HAS notification of detections
    And User stops motion detecting by telegram
    And There are detections with number more than threshold
    Then Program DOESN'T detect motion
    And User HASN'T notification of detections