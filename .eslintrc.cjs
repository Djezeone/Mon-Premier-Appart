/**
 * Configuration ESLint pour le projet React + TypeScript
 * 
 * Ce fichier définit les règles de linting pour assurer la qualité du code :
 * - Règles de base recommandées par ESLint
 * - Règles TypeScript recommandées
 * - Règles React recommandées
 * - Intégration avec Prettier pour éviter les conflits de formatage
 * 
 * Usage:
 *   npm run lint       : Vérifie le code
 *   npm run lint --fix : Corrige automatiquement les erreurs fixables
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // Règles personnalisées si nécessaire
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/ban-ts-comment': 'warn',
    'react/prop-types': 'off', // On utilise TypeScript pour les types
    'react/no-unescaped-entities': 'warn', // Permettre les entités non échappées comme warning
    'react/jsx-no-target-blank': 'warn',
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.ts'],
};
