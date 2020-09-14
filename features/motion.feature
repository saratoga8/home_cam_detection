Feature: Motion detecting by program

  Scenario Outline: User starts motions detecting
    Given There are no detections in directory
    When User starts program
    And There are detections with number <sign> than threshold
    Then Program <action> detect motion

    Examples:
      | action  | sign |
      | DOES    | more |
      | DOESN'T | less |

  Scenario: User stops motion detecting
    Given There are no detections in directory
    When User starts program
    And There are detections with number more than threshold
    And Program DOES detect motion
    And User stops motion detecting by program
    Then Program DOESN'T detect motion

  Scenario:  User changes detection threshold
    Given There are no detections in directory
    When User starts program
    And There are detections with number more than threshold
    And Program DOES detect motion
    And User deletes all files of detections
    And User increases detection threshold
    And There are detections with number more than threshold
    Then Program DOES detect motion

  Scenario: Detection periods don't depend on each other
    Given There are no detections in directory
    When User starts program
    And User sets time between detections 2s
    And There are detections with number less than threshold
    Then Program DOESN'T detect motion
    When There are detections with number less than threshold
    Then Program DOESN'T detect motion
    When There are detections with number less than threshold
    Then Program DOESN'T detect motion
