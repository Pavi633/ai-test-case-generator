import { buildTestCasePrompt } from '../prompts/testCasePrompt.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export async function checkOllamaHealth() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { available: false, models: [] };
    const data = await response.json();
    const models = (data.models || []).map((m) => m.name);
    return { available: true, models };
  } catch {
    return { available: false, models: [] };
  }
}

export async function generateTestCases(userStory) {
  const prompt = buildTestCasePrompt(userStory);

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.3,
        num_predict: 1500,
      },
    }),
    signal: AbortSignal.timeout(300000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const raw = data.response?.trim();

  if (!raw) {
    throw new Error('Empty response from Ollama. Ensure the model is pulled: ollama pull llama3');
  }

  return parseLLMResponse(raw, userStory);
}

function parseLLMResponse(raw, userStory) {
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Failed to parse LLM JSON response. Try regenerating.');
      }
    } else {
      throw new Error('LLM did not return valid JSON. Try regenerating.');
    }
  }

  const positive = normalizeScenarios(parsed.positive, 'positive');
  const negative = normalizeScenarios(parsed.negative, 'negative');
  const edge = normalizeScenarios(parsed.edge, 'edge');

  const deduped = deduplicateScenarios({ positive, negative, edge });

  let gherkin = parsed.gherkin || '';
  if (!gherkin.trim()) {
    gherkin = buildGherkinFromScenarios(userStory, deduped);
  }

  const totalGenerated =
    deduped.positive.length + deduped.negative.length + deduped.edge.length;

  const expectedScenarios = Math.max(
    parsed.expectedScenarios || 0,
    estimateExpectedScenarios(userStory, parsed.analysis),
    totalGenerated
  );

  const coverageScore = Math.min(
    100,
    Math.round((totalGenerated / expectedScenarios) * 100)
  );

  const confidence = Math.min(100, Math.max(0, parsed.confidence || 75));

  return {
    positive: deduped.positive,
    negative: deduped.negative,
    edge: deduped.edge,
    gherkin,
    analysis: parsed.analysis || {},
    expectedScenarios,
    totalScenarios: totalGenerated,
    coverageScore,
    confidence,
    duplicatesRemoved: deduped.duplicatesRemoved,
  };
}

function normalizeScenarios(scenarios, type) {
  if (!Array.isArray(scenarios)) return [];

  return scenarios
    .map((s, index) => {
      if (typeof s === 'string') {
        return {
          title: s.slice(0, 80) || `${type} scenario ${index + 1}`,
          severity: 'Medium',
          steps: [`Given ${s}`, 'When the action is performed', 'Then the expected result occurs'],
        };
      }
      return {
        title: s.title || `${type} scenario ${index + 1}`,
        severity: normalizeSeverity(s.severity),
        steps: Array.isArray(s.steps) ? s.steps : [],
      };
    })
    .filter((s) => s.title && s.steps.length > 0);
}

function normalizeSeverity(severity) {
  const s = String(severity || 'Medium').toLowerCase();
  if (s.includes('high')) return 'High';
  if (s.includes('low')) return 'Low';
  return 'Medium';
}

function deduplicateScenarios({ positive, negative, edge }) {
  const seen = new Set();
  let duplicatesRemoved = 0;

  const dedupe = (scenarios) =>
    scenarios.filter((scenario) => {
      const key = `${scenario.title.toLowerCase().trim()}|${scenario.steps.join('|').toLowerCase()}`;
      if (seen.has(key)) {
        duplicatesRemoved++;
        return false;
      }
      seen.add(key);
      return true;
    });

  return {
    positive: dedupe(positive),
    negative: dedupe(negative),
    edge: dedupe(edge),
    duplicatesRemoved,
  };
}

function estimateExpectedScenarios(userStory, analysis) {
  let base = 8;

  if (analysis?.functionalRequirements?.length) {
    base = analysis.functionalRequirements.length * 3;
  } else {
    const criteria = (userStory.match(/\b(so that|acceptance|criteria|must|should)\b/gi) || []).length;
    const sentences = userStory.split(/[.!?]+/).filter((s) => s.trim().length > 10).length;
    base = Math.max(8, (sentences + criteria) * 2);
  }

  return Math.min(50, Math.max(8, base));
}

function buildGherkinFromScenarios(userStory, { positive, negative, edge }) {
  const featureTitle = extractFeatureTitle(userStory);
  const lines = [`Feature: ${featureTitle}`, ''];

  const allScenarios = [
    ...positive.map((s) => ({ ...s, tag: 'positive' })),
    ...negative.map((s) => ({ ...s, tag: 'negative' })),
    ...edge.map((s) => ({ ...s, tag: 'edge' })),
  ];

  for (const scenario of allScenarios) {
    lines.push(`  @${scenario.tag} @${scenario.severity.toLowerCase()}`);
    lines.push(`  Scenario: ${scenario.title}`);
    for (const step of scenario.steps) {
      lines.push(`    ${step}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

function extractFeatureTitle(userStory) {
  const match = userStory.match(/I want to (.+?)(?:\s+so that|\s*$)/i);
  if (match) {
    return match[1].trim().replace(/^./, (c) => c.toUpperCase());
  }
  const firstLine = userStory.split('\n')[0].trim();
  return firstLine.slice(0, 60) || 'Generated Feature';
}
