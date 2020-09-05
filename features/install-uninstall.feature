Feature: Install/Uninstall the program

  Scenario: Installing the program
    Given The program hasn't installed
    When User installs the program
    Then The program has installed

  Scenario: Starting/Stopping program after install
    Given Given The program hasn't installed
    When User installs the program
    And User starts program
    Then User stops program

  Scenario: Un-installing the program
    Given The program hasn't installed
    When User installs the program
    And The program has installed
    And User un-installs the program
    Then The program hasn't installed