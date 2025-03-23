import js from "@eslint/js"
import prettier from "eslint-plugin-prettier/recommended"
import react from "eslint-plugin-react"
import eslintPluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  prettier,
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  // @ts-expect-error: Unconcise types.
  react.configs.flat["recommended"],
  react.configs.flat["jsx-runtime"],
  {
    ignores: ["dist/"],
  },
  {
    plugins: {
      "react-hooks": eslintPluginReactHooks,
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
      // "react/prop-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-explicit-any": "off",
      ...eslintPluginReactHooks.configs.recommended.rules,
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
