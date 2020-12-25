@telegram
Feature: Using telegram bot for controlling detection process

  Background:
    Given User has telegram bot

  @current
  Scenario: Starting detections
    When User starts program with io TELEGRAM
    And User starts motion detecting by telegram
#    Then User GETS notification of starting

  Scenario: Stopping detections
    When User starts program with io TELEGRAM
    And User starts motion detecting by telegram
    And User GETS notification of starting
    And User stops motion detecting by telegram
    Then User GETS notification of stopping

  Scenario: Re-starting detections
    When User starts program with io TELEGRAM
    And User starts motion detecting by telegram
    And User GETS notification of starting
    And User stops motion detecting by telegram
    And User GETS notification of stopping
    And User starts motion detecting by telegram
    Then User GETS notification of starting

  Scenario Outline: Getting images/video of detections
    And User sets message type <type>
    When User starts program with io TELEGRAM
    And User starts motion detecting by telegram
    And There are detections with number more than threshold
    And User GETS notification of detections

    Examples:
      | type  |
      | IMAGE |
      | VIDEO |
