# Contributing

Thanks for helping improve `jsdoc-lint`.

## Development

Use Node.js 24.

```sh
pnpm install
pnpm run check
pnpm run typecheck
pnpm run test:coverage
pnpm run build
pnpm run test:package
```

The package is authored in TypeScript and published as built JavaScript plus declaration files. Keep source compatible with the build config and verify the generated package before release.

## Pull Requests

- Keep changes focused.
- Add or update tests for behavior changes.
- Run Biome, typecheck, and coverage before opening a PR.
- Update documentation when user-facing behavior changes.
