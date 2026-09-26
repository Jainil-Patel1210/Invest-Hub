import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Default no-unused-vars only flags a *trailing* unused parameter
      // ("after-used"). Express's error-handling middleware signature
      // requires exactly 4 declared parameters even when the last one
      // (`next`) is never called, so an underscore-prefixed name needs to be
      // universally exempt, not just when something after it happens to be used.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
