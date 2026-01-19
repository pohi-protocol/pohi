import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Disable rules that conflict with Prettier
  eslintConfigPrettier,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.next/**',
      '**/out/**',
      '**/cache/**',
      '**/broadcast/**',
      'packages/contracts/**',
      'packages/demo/**', // Has its own eslint config
    ],
  },

  // Custom rules for all TypeScript files
  {
    files: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
    rules: {
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Allow explicit any in some cases (warn instead of error)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Prefer const
      'prefer-const': 'error',
      // No console in production code (warn)
      'no-console': 'warn',
    },
  },

  // Relax rules for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // CLI tools need console output
  {
    files: [
      'packages/cli/src/**/*.ts',
      'packages/bitbucket-pipe/src/**/*.ts',
      'packages/gitlab-ci/src/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  }
)
