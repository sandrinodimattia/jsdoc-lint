import { spawnSync } from 'node:child_process';
import path from 'node:path';

const packageRoot = process.cwd();
const packResult = spawnSync('pnpm', ['pack', '--dry-run', '--json'], {
  cwd: packageRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});

if (packResult.status !== 0) {
  process.exit(packResult.status ?? 1);
}

const jsonStart = packResult.stdout.indexOf('{');
if (jsonStart === -1) {
  throw new Error('Package dry run did not emit JSON output.');
}

const packInfo = JSON.parse(packResult.stdout.slice(jsonStart));
const packedFiles = new Set(packInfo.files.map((file) => file.path));
const requiredFiles = ['dist/cli/index.js', 'dist/index.d.ts', 'dist/index.js', 'LICENSE', 'package.json', 'README.md'];

const missingFiles = requiredFiles.filter((file) => !packedFiles.has(file));
if (missingFiles.length > 0) {
  throw new Error(`Packed package is missing required files: ${missingFiles.join(', ')}`);
}

await import(path.join(packageRoot, 'dist/index.js'));
await import(path.join(packageRoot, 'dist/cli/index.js'));
