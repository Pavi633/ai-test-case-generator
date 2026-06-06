import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'app.db');
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

const db = new Database(dbPath);
db.exec(schema);
db.close();

console.log('Database initialized successfully at', dbPath);
