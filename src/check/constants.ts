/**
 * Default roots scanned for workspace packages.
 */
export const DEFAULT_ROOTS = ['apps', 'packages'];

/**
 * Default source file extensions included in the scan.
 */
export const DEFAULT_INCLUDE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts'];

/**
 * Default path fragments excluded from scanning.
 */
export const DEFAULT_EXCLUDE_PATHS = [
  '.git',
  '.next',
  '.turbo',
  '.yarn',
  '__mocks__',
  '__snapshots__',
  '__tests__',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'reui',
  'shadcn',
  'storybook-static',
  'target',
];

/**
 * Default filename patterns excluded from scanning.
 */
export const DEFAULT_EXCLUDE_FILES = ['\\.d\\.[cm]?ts$', '\\.test\\.[^.]+$', '\\.spec\\.[^.]+$', '\\.stories\\.[^.]+$'];
