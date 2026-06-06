export function buildTestCasePrompt(userStory) {
  return `You are a Senior QA Automation Engineer.

Analyze the following user story and generate comprehensive test cases.

Requirements:
1. Generate Positive Test Cases
2. Generate Negative Test Cases
3. Generate Edge Cases
4. Use Gherkin Syntax
5. Use Given When Then format
6. Avoid duplicate scenarios
7. Include validation scenarios
8. Include security scenarios
9. Include boundary test cases

User Story:
${userStory}

Return JSON only. No markdown, no explanation, no code fences.

Format:
{
  "positive": [{"title": "Scenario title", "severity": "High|Medium|Low", "steps": ["Given ...", "When ...", "Then ..."]}],
  "negative": [{"title": "Scenario title", "severity": "High|Medium|Low", "steps": ["Given ...", "When ...", "Then ..."]}],
  "edge": [{"title": "Scenario title", "severity": "High|Medium|Low", "steps": ["Given ...", "When ...", "Then ..."]}],
  "gherkin": "Feature: ...\\n\\nScenario: ...\\n\\nGiven ...\\nWhen ...\\nThen ...",
  "analysis": {
    "actors": ["..."],
    "functionalRequirements": ["..."],
    "inputs": ["..."],
    "outputs": ["..."],
    "validations": ["..."]
  },
  "expectedScenarios": 10,
  "confidence": 85
}

Rules:
- Each array item must have title, severity (High/Medium/Low), and steps array
- gherkin must be a complete valid .feature file string compatible with Cucumber and Behave
- expectedScenarios is your estimate of ideal test coverage count for this story
- confidence is 0-100 representing how confident you are in the generated test cases
- Generate at least 3 positive, 3 negative, and 2 edge cases when the story allows`;
}
