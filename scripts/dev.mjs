import { rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Fix: stale Next.js dev lock can block startup on Windows.
// Fix: file watching can be unreliable on synced folders (e.g., OneDrive); polling improves Fast Refresh.

const projectRoot = process.cwd();
const lockPath = path.join(projectRoot, '.next', 'dev', 'lock');

try {
  await rm(lockPath, { force: true });
} catch {
  // ignore
}

process.env.WATCHPACK_POLLING ||= 'true';
process.env.WATCHPACK_POLLING_INTERVAL ||= '500';

const args = ['dev', ...process.argv.slice(2)];
const child = spawn('next', args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('exit', (code, signal) => {
  if (typeof code === 'number') process.exit(code);
  process.exit(signal ? 1 : 0);
});
