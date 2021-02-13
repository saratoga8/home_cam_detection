@telegram
Feature: Using telegram bot for controlling detection process

  Background:
    Given User has telegram bot

  Scenario: Telegram connection
    When User starts program with io TELEGRAM
    And User connects to Telegram bot
    Then User connected to Telegram bot

  Scenario: Starting detections
    When User starts program with io TELEGRAM
    And User starts motion detecting by telegram
    Then User gets TXT notification of starting

  Scenario: Stopping detections
    When User starts program with io TELEGRAM
    And User stops motion detecting by telegram
    Then User gets TXT notification of stopping
    And Program DOESN'T detect motion

  Scenario Outline: Getting images/video of detections
    When User starts program with io TELEGRAM
    And There are no detections in directory
    And User sets message type <type>
    And User sets time between detections 2s
    And There are detections with number more than threshold
    Then User gets <type> notification of detection

    Examples:
      | type  |
      | IMAGE |
#      | VIDEO |
