import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  { name: 'Unified Backend (:5000)', cmd: 'npm', args: ['run', 'dev'], cwd: path.join(__dirname, 'backend') },
  { name: 'Unified Frontend (:4000)', cmd: 'npm', args: ['run', 'dev'], cwd: path.join(__dirname, 'frontend') },
];

const children = services.map((svc) => {
  console.log(`[starting] ${svc.name}`);
  const child = spawn(svc.cmd, svc.args, { cwd: svc.cwd, stdio: 'inherit', shell: true });
  child.on('exit', (code) => console.log(`[stopped] ${svc.name} (exit code ${code})`));
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
