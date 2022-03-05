Feature: Start/Stop motions detection when a defined device of user is unreachable/reachable

  @current
  Scenario Outline: At the beginning motions detection starts/stopped with dependency on the state of user's device
    Given user has one defined device
    And user's device is <device_state>
    When User starts program with io CLI
    And Sleep 25s
    Then The motion has <motion_state>

    Examples:
      | device_state | motion_state |
      | reachable    | stopped      |
      | unreachable  | started      |

  Scenario Outline: Motion detections starts/stopped with the dependency on the changing state of user's device
    Given user has one defined device
    And user's device is <device_state1>
    When User starts program with io CLI
    And The motion has <motion_state1>
    And user's device is <device_state2>
    Then The motion has <motion_state2>

    Examples:
      | device_state1 | motion_state1 | device_state2 | motion_state2 |
      | reachable     | stopped       | unreachable   | started       |
      | unreachable   | started       | reachable     | stopped       |

  Scenario: Between multiple unreachable devices someone got reachable the motions detection starts
    Given user has multiple defined devices
    And all user's devices are unreachable
    When User starts program with io CLI
    And The motion has started
    And some user's device is reachable
    Then The motion has stopped