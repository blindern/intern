import js from "@eslint/js"
import prettier from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"

export default defineConfig(
  prettier,
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    ignores: [],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-deprecated": "error",
    },
  },
)
