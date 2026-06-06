export function parseUserStory(userStory) {
  const story = userStory.trim();
  const asA = story.match(/As an?\s+([^,]+),?\s+I want to\s+(.+?)(?:\s+so that\s+(.+))?\.?$/is);

  if (asA) {
    return {
      actor: asA[1].trim(),
      action: asA[2].trim(),
      benefit: (asA[3] || 'achieve the desired outcome').trim(),
      featureTitle: capitalize(asA[2].trim().slice(0, 60)),
    };
  }

  const firstLine = story.split('\n')[0].trim();
  return {
    actor: 'user',
    action: firstLine || 'perform the described action',
    benefit: 'complete the task successfully',
    featureTitle: capitalize(firstLine.slice(0, 60) || 'Generated Feature'),
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildScenarioResult(userStory, { positive, negative, edge, analysis, confidence = 70 }) {
  const deduped = deduplicateScenarios({ positive, negative, edge });
  const totalGenerated =
    deduped.positive.length + deduped.negative.length + deduped.edge.length;
  const expectedScenarios = Math.max(8, Math.ceil(totalGenerated / 0.9));
  const coverageScore = Math.min(100, Math.round((totalGenerated / expectedScenarios) * 100));
  const gherkin = buildGherkinFromScenarios(userStory, deduped);

  return {
    positive: deduped.positive,
    negative: deduped.negative,
    edge: deduped.edge,
    gherkin,
    analysis,
    expectedScenarios,
    totalScenarios: totalGenerated,
    coverageScore,
    confidence,
    duplicatesRemoved: deduped.duplicatesRemoved,
    source: 'fallback',
  };
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

function buildGherkinFromScenarios(userStory, { positive, negative, edge }) {
  const parsed = parseUserStory(userStory);
  const lines = [`Feature: ${parsed.featureTitle}`, ''];

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

export function scenario(title, severity, steps) {
  return { title, severity, steps };
}
