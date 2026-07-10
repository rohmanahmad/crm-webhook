import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  js.config({
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      semi: ['error', 'never'],
    },
  }),
  tseslint.config({
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      semi: ['error', 'never'],
      '@typescript-eslint/semi': ['error', 'never'],
    },
  }),
]
