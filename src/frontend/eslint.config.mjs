import eslint from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "routeTree.gen.ts",
    "postcss.config.cjs",
    "postcss.config.js",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    rules: {
      // Prefer double quotes
      quotes: ["error", "double"],
    },
  },
]);
