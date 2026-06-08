Feature: Login using email and password

  @positive @high
  Scenario: Successful Login
    Given the user is on the login page
    When the user enters valid email and password
    Then the user should be redirected to the dashboard

  @negative @high
  Scenario: Invalid Password
    Given the user is on the login page
    When the user enters an invalid password
    Then an error message should be displayed

  @edge @medium
  Scenario: Maximum Input Length
    Given the user is on the login page
    When the user enters maximum allowed characters
    Then the system should handle the input correctly