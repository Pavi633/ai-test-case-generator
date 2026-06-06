import db from '../database/db.js';

export function getDashboardStats(req, res) {
  try {
    const userId = req.user.userId;

    const stats = db
      .prepare(
        `SELECT
          COUNT(DISTINCT us.id)                          AS totalStories,
          COALESCE(SUM(gc.positive_count), 0)            AS totalPositive,
          COALESCE(SUM(gc.negative_count), 0)            AS totalNegative,
          COALESCE(SUM(gc.edge_count), 0)                AS totalEdge,
          COALESCE(SUM(gc.positive_count + gc.negative_count + gc.edge_count), 0) AS totalTestCases,
          COALESCE(ROUND(AVG(gc.coverage_score), 1), 0)  AS avgCoverage,
          COALESCE(ROUND(AVG(gc.confidence_score), 1), 0) AS avgConfidence
        FROM UserStories us
        LEFT JOIN GeneratedCases gc ON gc.story_id = us.id
        WHERE us.user_id = ?`
      )
      .get(userId);

    res.json({
      totalStories: stats.totalStories || 0,
      totalTestCases: stats.totalTestCases || 0,
      totalPositive: stats.totalPositive || 0,
      totalNegative: stats.totalNegative || 0,
      totalEdge: stats.totalEdge || 0,
      avgCoverage: stats.avgCoverage || 0,
      avgConfidence: stats.avgConfidence || 0,
      totalFeatureFiles: stats.totalStories || 0, // one feature file per story
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

export function getDashboardRecent(req, res) {
  try {
    const userId = req.user.userId;

    const rows = db
      .prepare(
        `SELECT
          gc.id,
          us.story,
          gc.created_at,
          gc.coverage_score,
          gc.confidence_score,
          gc.positive_count,
          gc.negative_count,
          gc.edge_count,
          (gc.positive_count + gc.negative_count + gc.edge_count) AS total_scenarios
        FROM GeneratedCases gc
        JOIN UserStories us ON us.id = gc.story_id
        WHERE us.user_id = ?
        ORDER BY gc.created_at DESC
        LIMIT 5`
      )
      .all(userId);

    res.json(rows);
  } catch (err) {
    console.error('Dashboard recent error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
}
