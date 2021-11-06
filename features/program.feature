@program
Feature: Base actions on program

  Scenario Outline: Starting program
    When User starts program with io <type>
    Then The motion has started

    Examples:
      | type     |
      | CLI      |
      | TELEGRAM |

  Scenario Outline: Changing time between detections
    When User sets time between detections <num>s
    Then The time between detections is <num>s

    Examples:
      | num |
      | 3   |