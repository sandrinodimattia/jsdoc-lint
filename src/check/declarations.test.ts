import ts from 'typescript';
import { describe, expect, test } from 'vitest';
import { visitSourceFile } from './declarations.js';
import type { FailureEntry } from './types.js';

describe('visitSourceFile', () => {
  test('reports every supported documentable declaration kind', () => {
    const failures = collectDeclarationFailures(
      [
        'export class Widget {',
        '  value: string;',
        '  initialized = 1;',
        '  method() {}',
        '  get label() { return this.value; }',
        '  set label(value: string) { this.value = value; }',
        '  fieldArrow = () => {};',
        '  fieldFunction = function () {};',
        '}',
        'export default class {',
        '}',
        'export type Shape = {',
        '  area: number;',
        '};',
        'export default function() {}',
        'export function makeWidget() {}',
        'const answer = 42;',
        'const arrow = () => {};',
        'const expression = function () {};',
        'const values = {',
        '  one: 1,',
        '  two,',
        '  skip() {},',
        '  nestedArrow: () => {},',
        '  nested: {',
        '    value: 1,',
        '    arrow: () => {},',
        '    fn: function () {}',
        '  },',
        '};',
        'const pair = 1, other = 2;',
        'let ignored = 1;',
        'const wrapped = ({',
        '  wrappedValue: 1',
        '} satisfies Record<string, number>);',
        'const nonNullWrapped = ({',
        '  nonNullValue: 1',
        '} as Record<string, number>)!;',
        'const two = 2;',
        'for (const loopArrow = () => {}; false;) {}',
      ].join('\n'),
      'all.tsx',
      ts.ScriptKind.TSX
    );

    expect(failures.map(({ kind, name }) => ({ kind, name }))).toEqual([
      { kind: 'ClassDeclaration', name: 'Widget' },
      { kind: 'PropertyDeclaration', name: 'value' },
      { kind: 'PropertyDeclaration', name: 'initialized' },
      { kind: 'MethodDeclaration', name: 'method' },
      { kind: 'GetAccessor', name: 'label' },
      { kind: 'SetAccessor', name: 'label' },
      { kind: 'ArrowFunctionProperty', name: 'fieldArrow' },
      { kind: 'FunctionExpressionProperty', name: 'fieldFunction' },
      { kind: 'ClassDeclaration', name: '<anonymous>' },
      { kind: 'TypeAliasDeclaration', name: 'Shape' },
      { kind: 'PropertySignature', name: 'area' },
      { kind: 'FunctionDeclaration', name: '<anonymous>' },
      { kind: 'FunctionDeclaration', name: 'makeWidget' },
      { kind: 'TopLevelConstDeclaration', name: 'answer' },
      { kind: 'ArrowFunction', name: 'arrow' },
      { kind: 'FunctionExpression', name: 'expression' },
      { kind: 'TopLevelConstDeclaration', name: 'values' },
      { kind: 'TopLevelConstPropertyAssignment', name: 'one' },
      { kind: 'TopLevelConstShorthandProperty', name: 'two' },
      { kind: 'MethodDeclaration', name: 'skip' },
      { kind: 'TopLevelConstPropertyAssignment', name: 'nested' },
      { kind: 'ArrowFunctionProperty', name: 'arrow' },
      { kind: 'FunctionExpressionProperty', name: 'fn' },
      { kind: 'TopLevelConstDeclaration', name: 'wrapped' },
      { kind: 'TopLevelConstPropertyAssignment', name: 'wrappedValue' },
      { kind: 'TopLevelConstDeclaration', name: 'nonNullWrapped' },
      { kind: 'TopLevelConstPropertyAssignment', name: 'nonNullValue' },
      { kind: 'TopLevelConstDeclaration', name: 'two' },
      { kind: 'ArrowFunction', name: 'loopArrow' },
    ]);
  });

  test('accepts documented declarations and reports documented member spacing', () => {
    const failures = collectDeclarationFailures(
      [
        '/** Widget. */',
        'export class Widget {',
        '  /**',
        '   * First.',
        '   */',
        '  first: string;',
        '  /**',
        '   * Second.',
        '   */',
        '  second: string;',
        '',
        '  /**',
        '   * Action.',
        '   */',
        '  action() {}',
        '}',
        '/** Named user. */',
        'export interface User {',
        '  /** inline is not enough */',
        '  id: string;',
        '',
        '  /**',
        '   * Name.',
        '   */',
        '  name: string;',
        '}',
        '/** Alias. */',
        'export type Alias = {',
        '  /**',
        '   * Enabled.',
        '   */',
        '  enabled: boolean;',
        '};',
        '/**',
        ' * Count.',
        ' */',
        'const count = 1;',
        '/**',
        ' * Config.',
        ' */',
        'const config = {',
        '  /**',
        '   * Host.',
        '   */',
        "  host: 'localhost'",
        '};',
        '/** compute */',
        'const compute = () => 1;',
        '/**',
        ' * Final.',
        ' */',
        'const finalValue = 1;',
      ].join('\n')
    );

    expect(failures.map(({ kind, name }) => ({ kind, name }))).toEqual([
      { kind: 'PropertyDeclarationSpacing', name: 'first' },
      { kind: 'PropertySignature', name: 'id' },
      { kind: 'TopLevelConstDeclarationSpacing', name: 'count' },
      { kind: 'TopLevelConstDeclarationSpacing', name: 'config' },
    ]);
  });
});

function collectDeclarationFailures(
  sourceText: string,
  fileName = 'source.ts',
  scriptKind = ts.ScriptKind.TS
): Pick<FailureEntry, 'kind' | 'line' | 'name'>[] {
  const failures: Pick<FailureEntry, 'kind' | 'line' | 'name'>[] = [];
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, scriptKind);

  visitSourceFile(sourceFile, (failure) => failures.push(failure));

  return failures;
}
