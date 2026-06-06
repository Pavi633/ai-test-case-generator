CREATE TABLE IF NOT EXISTS Users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON Users(username);

CREATE TABLE IF NOT EXISTS UserStories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES Users(id) ON DELETE CASCADE,
  story      TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS GeneratedCases (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id            INTEGER NOT NULL,
  positive_count      INTEGER DEFAULT 0,
  negative_count      INTEGER DEFAULT 0,
  edge_count          INTEGER DEFAULT 0,
  gherkin_output      TEXT,
  positive_cases      TEXT,
  negative_cases      TEXT,
  edge_cases          TEXT,
  coverage_score      REAL DEFAULT 0,
  confidence_score    REAL DEFAULT 0,
  expected_scenarios  INTEGER DEFAULT 0,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES UserStories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_generated_cases_story_id ON GeneratedCases(story_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_created_at ON UserStories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON UserStories(user_id);
