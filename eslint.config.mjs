import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jest from "eslint-plugin-jest";
import playwright from "eslint-plugin-playwright";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends("eslint:recommended"),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      jest,
      playwright,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...jest.environments.globals.globals,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },

        project: true,
      },
    },

    rules: {
      "no-const-assign": "error",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "no-console": "error",
      "no-empty": "error",
      "no-extra-semi": "error",
      "multiline-comment-style": "off",
    },
  },
  {
    files: ["tests/**/*", "cli/**", "deployment/**"],

    rules: {
      "no-console": "off",
    },
  },
]);
