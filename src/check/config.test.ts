import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { loadConfig, normalizeOptions } from './config.js';
import { runCheck } from './index.js';

describe('loadConfig and normalizeOptions', () => {
  test('loads nearest config and applies config defaults', async () => {
    const workspaceRoot = await createWorkspace({
      'jsdoc.json': JSON.stringify({
        roots: ['custom'],
        excludePaths: ['generated'],
        excludeFiles: ['ignore-me'],
        includeExtensions: ['ts'],
      }),
      'custom/pkg/package.json': JSON.stringify({ name: '@scope/pkg' }),
      'custom/pkg/src/index.ts': 'export function checkMe() {}',
      'custom/pkg/src/generated/index.ts': 'export function ignorePath() {}',
      'custom/pkg/src/ignore-me.ts': 'export function ignoreFile() {}',
      'custom/pkg/src/nope.js': 'export function ignoreExtension() {}',
    });

    const { config, configPath, configRoot } = loadConfig({ cwd: join(workspaceRoot, 'custom/pkg') });
    const result = runCheck(
      normalizeOptions({
        cwd: workspaceRoot,
        workspaceRoot: configRoot,
        config,
      })
    );

    expect(configPath).toBe(join(workspaceRoot, 'jsdoc.json'));
    expect(result.failures.map((failure) => failure.name)).toEqual(['checkMe']);
  });

  test('supports explicit config paths, empty config fallback, CLI overrides, and invalid patterns', async () => {
    const workspaceRoot = await createWorkspace({
      'config/jsdoc.json': JSON.stringify({ roots: ['configured'], includeExtensions: ['js'] }),
      'configured/pkg/package.json': JSON.stringify({ name: '@scope/configured' }),
      'configured/pkg/src/index.js': 'export function configured() {}',
      'override/pkg/package.json': JSON.stringify({ name: '@scope/override' }),
      'override/pkg/src/index.ts': 'export function override() {}',
    });

    expect(() => loadConfig({ cwd: workspaceRoot, configPath: 'missing.json' })).toThrow(/Config file not found/);

    const explicitConfig = loadConfig({ cwd: workspaceRoot, configPath: 'config/jsdoc.json' });
    expect(explicitConfig.configRoot).toBe(join(workspaceRoot, 'config'));
    expect(loadConfig({ cwd: workspaceRoot })).toEqual({
      config: {},
      configPath: null,
      configRoot: workspaceRoot,
    });

    const result = runCheck(
      normalizeOptions({
        cwd: workspaceRoot,
        workspaceRoot,
        config: explicitConfig.config,
        roots: ['override', 'override'],
        includeExtensions: ['.ts'],
      })
    );
    expect(result.failures.map((failure) => failure.name)).toEqual(['override']);
    expect(() => normalizeOptions({ excludeFiles: ['['] })).toThrow(/Invalid exclude-file pattern/);
  });
});

async function createWorkspace(files: Record<string, string>): Promise<string> {
  const workspaceRoot = await mkdtemp(join(tmpdir(), 'jsdoc-lint-check-'));

  await Promise.all(
    Object.entries(files).map(async ([filePath, contents]) => {
      const absolutePath = join(workspaceRoot, filePath);
      await mkdir(join(absolutePath, '..'), { recursive: true });
      await writeFile(absolutePath, contents);
    })
  );

  return workspaceRoot;
}
