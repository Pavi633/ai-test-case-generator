import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'app.db');

if (!existsSync(dbPath)) {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  const initDb = new Database(dbPath);
  initDb.exec(schema);
  initDb.close();
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
