# jsdoc-lint

A TypeScript library and CLI for finding JavaScript and TypeScript declarations that are missing JSDoc comments.

`jsdoc-lint` is authored in TypeScript, publishes built JavaScript and declarations, and targets Node.js 24.

The checker covers:

- functions and function-like declarations
- classes, interfaces, and type aliases
- documented fields on classes, interfaces, and named object type aliases
- top-level `const` declarations
- direct properties inside top-level object-literal constants

## Install

```sh
pnpm add -D jsdoc-lint
```

## CLI

From a workspace root:

```sh
pnpm exec jsdoc-lint
```

Check specific package roots or file paths:

```sh
pnpm exec jsdoc-lint packages/ui
pnpm exec jsdoc-lint packages/ui/src/index.ts
```

Emit JSON instead of the default human-readable report:

```sh
pnpm exec jsdoc-lint --json
```

Show help:

```sh
pnpm exec jsdoc-lint --help
```

The CLI exits with:

- `0` when no diagnostics are found
- `1` when lint diagnostics are found
- `2` for usage or runtime errors

## Options

- `--config <path>`: load config from a specific JSON file
- `--root <path>`: add a root to scan when no positional targets are provided
- `--exclude-path <path>`: exclude a path segment or relative path prefix
- `--exclude-file <regex>`: exclude filenames or relative paths matching a regex
- `--include-ext <ext>`: restrict scanned file extensions
- `--json`: emit machine-readable JSON
- `-h`, `--help`: show usage

## Config

By default the checker walks upward from the current directory and loads the nearest `jsdoc.json`.

Supported config keys:

- `roots: string[]`
- `excludePaths: string[]`
- `excludeFiles: string[]`
- `includeExtensions: string[]`

Example:

```json
{
  "roots": ["apps", "packages"],
  "excludePaths": ["node_modules", "dist", ".next", "packages/ui/src/generated"],
  "excludeFiles": ["\\.d\\.[cm]?ts$", "\\.test\\.[^.]+$", "\\.spec\\.[^.]+$"],
  "includeExtensions": [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts"]
}
```

CLI flags override config values for the current run.

## Library

```ts
import {
  formatReport,
  loadConfig,
  normalizeOptions,
  runCheck
} from "jsdoc-lint";

const { config, configRoot } = loadConfig({ cwd: process.cwd() });
const options = normalizeOptions({
  cwd: process.cwd(),
  workspaceRoot: configRoot,
  config
});

const result = runCheck(options);
console.log(formatReport(result));
```

## Development

```sh
pnpm install
pnpm test
pnpm run test:coverage
pnpm run typecheck
pnpm run build
pnpm run test:package
```
