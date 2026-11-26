import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const unifiedDist = path.join(frontendRoot, 'dist');

const apps = [
  {
    name: 'Event & Space (/events, /spaces)',
    dir: path.join(frontendRoot, 'Event-and-Space'),
    distSubDir: '',
  },
  {
    name: 'TRACE Community (/community)',
    dir: path.join(frontendRoot, 'Community-project-main', 'client'),
    distSubDir: 'community',
  },
  {
    name: 'Innovation Academy (/innovation-academy)',
    dir: path.join(frontendRoot, 'Innovation-Academy-main', 'client'),
    distSubDir: 'innovation-academy',
  },
];

const run = (cmd, cwd) => {
  console.log(`\n> [${path.relative(frontendRoot, cwd)}] ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
};

fs.rmSync(unifiedDist, { recursive: true, force: true });
fs.mkdirSync(unifiedDist, { recursive: true });

for (const app of apps) {
  console.log(`\n========================================`);
  console.log(`Building ${app.name}`);
  console.log(`========================================`);

  if (!fs.existsSync(path.join(app.dir, 'node_modules'))) {
    run('npm install', app.dir);
  }

  run('npm run build', app.dir);

  const srcDist = path.join(app.dir, 'dist');
  const targetDir = app.distSubDir ? path.join(unifiedDist, app.distSubDir) : unifiedDist;

  if (!fs.existsSync(srcDist)) {
    throw new Error(`Build output not found at ${srcDist}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(srcDist, targetDir, { recursive: true });
}

console.log(`\nUnified build completed successfully at: ${unifiedDist}`);
