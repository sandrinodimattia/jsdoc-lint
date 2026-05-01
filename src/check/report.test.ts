import { describe, expect, test } from 'vitest';
import { formatJsonReport, formatReport } from './report.js';

describe('formatReport', () => {
  test('formats an empty result', () => {
    expect(formatReport({ failures: [] })).toBe('All checked declarations have multiline JSDoc.');
  });

  test('formats grouped failures and JSON output', () => {
    const result = {
      failures: [
        {
          packageName: 'b',
          packageRelativeRoot: 'packages/b',
          relativeFilePath: 'packages/b/src/b.ts',
          line: 12,
          kind: 'FunctionDeclaration',
          name: 'beta',
        },
        {
          packageName: 'a',
          packageRelativeRoot: 'packages/a',
          relativeFilePath: 'packages/a/src/a.ts',
          line: 2,
          kind: 'ClassDeclaration',
          name: 'Alpha',
        },
        {
          packageName: 'a',
          packageRelativeRoot: 'packages/a',
          relativeFilePath: 'packages/a/src/a.ts',
          line: 10,
          kind: 'MethodDeclaration',
          name: 'run',
        },
        {
          packageName: 'a',
          packageRelativeRoot: 'packages/a',
          relativeFilePath: 'packages/a/src/other.ts',
          line: 1,
          kind: 'FunctionDeclaration',
          name: 'other',
        },
      ],
    };

    expect(formatReport(result)).toContain('Missing multiline JSDoc comments in 4 declarations across 2 packages.');
    expect(formatReport(result).indexOf('a (packages/a)')).toBeLessThan(formatReport(result).indexOf('b (packages/b)'));
    expect(formatReport(result).indexOf('packages/a/src/a.ts')).toBeLessThan(
      formatReport(result).indexOf('packages/a/src/other.ts')
    );
    expect(JSON.parse(formatJsonReport(result))).toEqual(result);
  });
});
