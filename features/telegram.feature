Feature: Using telegram bot for controlling detection process

  Scenario: Getting detections
    Given User has telegram bot
    When program detects any motion
    Then user gets notification of detections