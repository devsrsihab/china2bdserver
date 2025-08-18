// @ts-check
// @ts-ignore
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**'], // Add other patterns as needed
  },
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off', // Disable the base rule as it can report incorrect errors for TypeScript
      '@typescript-eslint/no-unused-vars': 'error', // Use the TypeScript-specific rule instead
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-undef': 'error',
      'no-console': 'warn',
    },
  },
];
