import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ['.next/**', '.codex/**', 'node_modules/**', 'coverage/**'] },
  ...compat.extends('next/core-web-vitals').map(config => ({
    ...config,
    files: ['**/*.{js,jsx,mjs,cjs}'],
  })),
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    },
  },
];

export default eslintConfig;
