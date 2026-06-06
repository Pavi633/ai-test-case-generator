import { parseUserStory, buildScenarioResult, scenario } from './testCaseUtils.js';

export function generateTestCasesFallback(userStory) {
  const parsed = parseUserStory(userStory);
  const { actor, action, benefit, featureTitle } = parsed;
  const actionLower = action.toLowerCase();

  const page = guessPage(actionLower);
  const inputs = guessInputs(actionLower);

  const positive = [
    scenario(
      `Successful ${featureTitle}`,
      'High',
      [
        `Given the ${actor} is on the ${page}`,
        `When the ${actor} ${action} with valid ${inputs.join(' and ')}`,
        `Then the ${actor} should ${benefit}`,
      ]
    ),
    scenario(
      'Valid input validation passes',
      'Medium',
      [
        `Given the ${actor} is on the ${page}`,
        `When the ${actor} enters valid data in all required fields`,
        'Then the form should be accepted without errors',
      ]
    ),
    scenario(
      'Successful submission confirmation',
      'Medium',
      [
        `Given the ${actor} has provided valid information`,
        `When the ${actor} submits the ${page}`,
        'Then a success confirmation should be displayed',
      ]
    ),
    scenario(
      'Authorized access granted',
      'High',
      [
        `Given the ${actor} has valid credentials or permissions`,
        `When the ${actor} attempts to ${action}`,
        `Then access should be granted to ${benefit}`,
      ]
    ),
  ];

  const negative = [
    scenario(
      'Missing required fields',
      'High',
      [
        `Given the ${actor} is on the ${page}`,
        'When the required fields are left empty and the form is submitted',
        'Then validation error messages should be displayed',
      ]
    ),
    scenario(
      'Invalid input format',
      'High',
      [
        `Given the ${actor} is on the ${page}`,
        `When the ${actor} enters invalid ${inputs[0] || 'input'}`,
        'Then an appropriate error message should be shown',
      ]
    ),
    scenario(
      'Unauthorized access attempt',
      'High',
      [
        `Given the ${actor} is not authenticated`,
        `When the ${actor} attempts to ${action}`,
        'Then access should be denied with an error message',
      ]
    ),
    scenario(
      'Server error handling',
      'Medium',
      [
        `Given the backend service is unavailable`,
        `When the ${actor} attempts to ${action}`,
        'Then a user-friendly error message should be displayed',
      ]
    ),
  ];

  const edge = [
    scenario(
      'Maximum input length boundary',
      'Medium',
      [
        `Given the ${actor} is on the ${page}`,
        'When the maximum allowed characters are entered in input fields',
        'Then the input should be accepted or show a clear limit message',
      ]
    ),
    scenario(
      'Special characters in input',
      'Medium',
      [
        `Given the ${actor} is on the ${page}`,
        'When input contains special characters (<script>, SQL, unicode)',
        'Then input should be sanitized and handled safely',
      ]
    ),
    scenario(
      'Session timeout during action',
      'Low',
      [
        `Given the ${actor} session has expired`,
        `When the ${actor} attempts to ${action}`,
        'Then the user should be redirected to login with a session expired message',
      ]
    ),
    scenario(
      'Concurrent duplicate submission',
      'Low',
      [
        `Given the ${actor} has already submitted the form`,
        'When the submit button is clicked multiple times rapidly',
        'Then only one action should be processed',
      ]
    ),
  ];

  const analysis = {
    actors: [actor],
    functionalRequirements: [action, benefit],
    inputs,
    outputs: [benefit, 'success confirmation', 'error messages'],
    validations: ['required fields', 'input format', 'authorization'],
  };

  return buildScenarioResult(userStory, {
    positive,
    negative,
    edge,
    analysis,
    confidence: 65,
  });
}

function guessPage(actionLower) {
  if (/login|sign in|authenticate/.test(actionLower)) return 'login page';
  if (/register|sign up|create account/.test(actionLower)) return 'registration page';
  if (/search|find|filter/.test(actionLower)) return 'search page';
  if (/checkout|purchase|buy|pay/.test(actionLower)) return 'checkout page';
  if (/upload|attach/.test(actionLower)) return 'upload page';
  if (/profile|account|settings/.test(actionLower)) return 'account settings page';
  return 'application page';
}

function guessInputs(actionLower) {
  if (/login|sign in|authenticate/.test(actionLower)) return ['email', 'password'];
  if (/register|sign up/.test(actionLower)) return ['email', 'password', 'confirm password'];
  if (/search|find/.test(actionLower)) return ['search query'];
  if (/checkout|purchase|pay/.test(actionLower)) return ['payment details', 'shipping address'];
  if (/email|password/.test(actionLower)) return ['email', 'password'];
  return ['required input data'];
}
