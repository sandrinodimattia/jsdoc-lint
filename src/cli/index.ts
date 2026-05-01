#!/usr/bin/env node

import { runCli } from './run.ts';

export { runCli } from './run.ts';
export type { CliContext } from './types.ts';

/* v8 ignore next 4 -- covered by the packaged CLI smoke test. */
if (import.meta.main) {
  const exitCode = await runCli();
  process.exitCode = exitCode;
}
