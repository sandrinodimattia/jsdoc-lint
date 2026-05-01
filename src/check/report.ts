import type { CheckResult, FailureEntry } from './types.ts';

/**
 * Formats checker failures for terminal output.
 *
 * @param result Checker result.
 * @returns Human-readable report.
 */
export function formatReport(result: CheckResult): string {
  if (result.failures.length === 0) {
    return 'All checked declarations have multiline JSDoc.';
  }

  const packageGroups = groupBy(result.failures, (failure) => failure.packageName);
  const packageNames = [...packageGroups.keys()].sort((left, right) => left.localeCompare(right));
  const lines = [
    `Missing multiline JSDoc comments in ${result.failures.length} declaration${result.failures.length === 1 ? '' : 's'} across ${packageGroups.size} package${packageGroups.size === 1 ? '' : 's'}.`,
    '',
  ];

  for (const packageName of packageNames) {
    const packageFailures = packageGroups.get(packageName) as FailureEntry[];
    const packageRelativeRoot = (packageFailures[0] as FailureEntry).packageRelativeRoot;
    lines.push(`${packageName} (${packageRelativeRoot})`);

    const fileGroups = groupBy(packageFailures, (failure) => failure.relativeFilePath);
    const filePaths = [...fileGroups.keys()].sort((left, right) => left.localeCompare(right));

    for (const filePath of filePaths) {
      lines.push(`  ${filePath}`);

      const fileFailures = (fileGroups.get(filePath) as FailureEntry[]).sort((left, right) => left.line - right.line);
      for (const failure of fileFailures) {
        const line = String(failure.line).padStart(4, ' ');
        const kind = failure.kind.padEnd(20, ' ');
        lines.push(`    ${line}  ${kind}  ${failure.name}`);
      }
    }

    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

/**
 * Serializes checker results for machine-readable consumers.
 *
 * @param result Checker result.
 * @returns JSON report string.
 */
export function formatJsonReport(result: CheckResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Groups items by a derived string key.
 *
 * @template T
 * @param items Items to group.
 * @param getKey Key selector.
 * @returns Grouped items.
 */
function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const current = groups.get(key);
    if (current) {
      current.push(item);
      continue;
    }

    groups.set(key, [item]);
  }

  return groups;
}
