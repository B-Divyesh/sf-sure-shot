import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "test-results/**", ".factory/evidence*/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.{ts,mjs}", "*.ts"],
    languageOptions: {
      globals: {
        document: "readonly",
        history: "readonly",
        localStorage: "readonly",
        location: "readonly",
        matchMedia: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
        window: "readonly",
      },
    },
  },
);
