import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function ensure(dir) {
  const nodeModules = join(root, dir, 'node_modules');
  if (!existsSync(nodeModules)) {
    console.log(`Installing ${dir} dependencies...`);
    execSync('npm install', { cwd: join(root, dir), stdio: 'inherit' });
  }
}

ensure('backend');
ensure('frontend');

const dbPath = join(root, 'backend', 'database', 'app.db');
if (!existsSync(dbPath)) {
  console.log('Initializing database...');
  execSync('npm run init-db', { cwd: join(root, 'backend'), stdio: 'inherit' });
}
