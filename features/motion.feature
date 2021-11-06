@motion
Feature: Motion detecting by program

  Background:
    Given There are no detections in directory
    And User sets time between detections 2s
    When User starts program with io CLI
#    And The motion has started

  Scenario Outline: User starts motions detecting
    And There are detections with number <sign> than threshold
    Then Program <action> detect motion

    Examples:
      | action  | sign |
      | DOES    | more |
      | DOESN'T | less |

    @current
  Scenario: User stops motion detecting
    And There are detections with number more than threshold
    And Program DOES detect motion
    And User stops motion detecting by program
    Then Program DOESN'T detect motion

  Scenario:  User changes detection threshold
    And There are detections with number more than threshold
    And Program DOES detect motion
    And User deletes all files of detections
    And User increases detection threshold
    And There are detections with number more than threshold
    Then Program DOES detect motion

  Scenario: Detection periods don't depend on each other
    And There are detections with number less than threshold
    And Program DOESN'T detect motion
    And Sleep 4s
    And There are detections with number less than threshold
    And Program DOESN'T detect motion
    And Sleep 4s
    And There are detections with number less than threshold
    Then Program DOESN'T detect motion
