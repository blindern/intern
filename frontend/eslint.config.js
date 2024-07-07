import { fixupPluginRules } from "@eslint/compat"
import deprecationPlugin from "eslint-plugin-deprecation"
import js from "@eslint/js"
import prettier from "eslint-plugin-prettier/recommended"
import globals from "globals"
import tseslint from "typescript-eslint"
// @ts-expect-error: Missing types.
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
// @ts-expect-error: Missing types.
import eslintPluginReactHooks from "eslint-plugin-react-hooks"

/** @type import("eslint").Linter.RulesRecord */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const reactHookRules = eslintPluginReactHooks.configs.recommended.rules

export default tseslint.config(
  prettier,
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  reactRecommended,
  {
    ignores: ["dist/"],
  },
  {
    plugins: {
      // @ts-expect-error: Improper v9 support workaround. See https://github.com/gund/eslint-plugin-deprecation/issues/78
      deprecation: fixupPluginRules(deprecationPlugin),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      "react-hooks": fixupPluginRules(eslintPluginReactHooks),
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-explicit-any": "off",
      ...reactHookRules,
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
)
