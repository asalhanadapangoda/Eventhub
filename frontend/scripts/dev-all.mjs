import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

const services = [
  { name: 'events-spaces', cwd: path.join(frontendRoot, 'Event-and-Space'), cmd: 'npm run dev' },
  { name: 'community', cwd: path.join(frontendRoot, 'Community-project-main', 'client'), cmd: 'npm run dev' },
  { name: 'academy', cwd: path.join(frontendRoot, 'Innovation-Academy-main', 'client'), cmd: 'npm run dev' },
];

const children = services.map((svc) => {
  console.log(`[start] ${svc.name} (${svc.cwd})`);
  const child = spawn(svc.cmd, { cwd: svc.cwd, stdio: 'inherit', shell: true });
  child.on('exit', (code) => {
    console.log(`[exit] ${svc.name} exited with code ${code}`);
  });
  return child;
});

const shutdown = () => {
  children.forEach((c) => {
    try { c.kill(); } catch {}
  });
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
