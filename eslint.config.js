import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// ✅ CONFIGURATION ESLINT SIMPLIFIÉE ET FONCTIONNELLE
export default [
  { ignores: ["dist", "node_modules"] },
  
  // Configuration JavaScript/TypeScript de base
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Configuration pour les fichiers TypeScript/React
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Règles React Hooks
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Général
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  }
];
