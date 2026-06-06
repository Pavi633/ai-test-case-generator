import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from '../database/db.js';
import { generateTestCases } from './ollamaService.js';
import { generateTestCasesFallback } from './fallbackService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const featuresDir = join(__dirname, '..', 'generated-features');

if (!existsSync(featuresDir)) {
  mkdirSync(featuresDir, { recursive: true });
}

export async function generateAndSave(userStory, options = {}, userId) {
  const trimmedStory = userStory.trim();
  if (!trimmedStory) {
    throw new Error('User story is required');
  }

  if (trimmedStory.length < 10) {
    throw new Error('User story must be at least 10 characters');
  }

  const result = options.useFallback
    ? generateTestCasesFallback(trimmedStory)
    : await generateTestCases(trimmedStory);

  const insertStory = db.prepare('INSERT INTO UserStories (user_id, story) VALUES (?, ?)');
  const storyResult = insertStory.run(userId, trimmedStory);
  const storyId = storyResult.lastInsertRowid;

  const featureFilename = `story-${storyId}-${Date.now()}.feature`;
  const featurePath = join(featuresDir, featureFilename);
  writeFileSync(featurePath, result.gherkin, 'utf-8');

  const insertCase = db.prepare(`
    INSERT INTO GeneratedCases (
      story_id, positive_count, negative_count, edge_count,
      gherkin_output, positive_cases, negative_cases, edge_cases,
      coverage_score, confidence_score, expected_scenarios
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const caseResult = insertCase.run(
    storyId,
    result.positive.length,
    result.negative.length,
    result.edge.length,
    result.gherkin,
    JSON.stringify(result.positive),
    JSON.stringify(result.negative),
    JSON.stringify(result.edge),
    result.coverageScore,
    result.confidence,
    result.expectedScenarios
  );

  return {
    id: caseResult.lastInsertRowid,
    storyId,
    positive: result.positive,
    negative: result.negative,
    edge: result.edge,
    gherkin: result.gherkin,
    analysis: result.analysis,
    totalScenarios: result.totalScenarios,
    coverageScore: result.coverageScore,
    confidence: result.confidence,
    expectedScenarios: result.expectedScenarios,
    duplicatesRemoved: result.duplicatesRemoved,
    featureFile: featureFilename,
  };
}

export function getHistory(search = '', userId) {
  let query = `
    SELECT
      gc.id,
      gc.story_id,
      us.story,
      gc.positive_count,
      gc.negative_count,
      gc.edge_count,
      gc.coverage_score,
      gc.confidence_score,
      gc.expected_scenarios,
      gc.created_at,
      (gc.positive_count + gc.negative_count + gc.edge_count) AS total_scenarios
    FROM GeneratedCases gc
    JOIN UserStories us ON us.id = gc.story_id
  `;

  const params = [userId];
  query += ' WHERE us.user_id = ?';
  if (search.trim()) {
    query += ' AND us.story LIKE ?';
    params.push(`%${search.trim()}%`);
  }

  query += ' ORDER BY gc.created_at DESC LIMIT 100';

  return db.prepare(query).all(...params);
}

export function getHistoryById(id, userId) {
  const row = db
    .prepare(
      `
    SELECT
      gc.*,
      us.story,
      (gc.positive_count + gc.negative_count + gc.edge_count) AS total_scenarios
    FROM GeneratedCases gc
    JOIN UserStories us ON us.id = gc.story_id
    WHERE gc.id = ? AND us.user_id = ?
  `
    )
    .get(id, userId);

  if (!row) return null;

  return {
    id: row.id,
    storyId: row.story_id,
    story: row.story,
    positive: JSON.parse(row.positive_cases || '[]'),
    negative: JSON.parse(row.negative_cases || '[]'),
    edge: JSON.parse(row.edge_cases || '[]'),
    gherkin: row.gherkin_output,
    positiveCount: row.positive_count,
    negativeCount: row.negative_count,
    edgeCount: row.edge_count,
    totalScenarios: row.total_scenarios,
    coverageScore: row.coverage_score,
    confidence: row.confidence_score,
    expectedScenarios: row.expected_scenarios,
    createdAt: row.created_at,
  };
}

export function deleteHistory(id, userId) {
  const row = db
    .prepare(
      `SELECT gc.story_id FROM GeneratedCases gc
       JOIN UserStories us ON us.id = gc.story_id
       WHERE gc.id = ? AND us.user_id = ?`
    )
    .get(id, userId);
  if (!row) return false;

  db.prepare('DELETE FROM GeneratedCases WHERE id = ?').run(id);

  const remaining = db
    .prepare('SELECT COUNT(*) as count FROM GeneratedCases WHERE story_id = ?')
    .get(row.story_id);

  if (remaining.count === 0) {
    db.prepare('DELETE FROM UserStories WHERE id = ?').run(row.story_id);
  }

  return true;
}
