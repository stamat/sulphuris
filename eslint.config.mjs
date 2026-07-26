import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'src/**/*.test.ts', 'script/*.mjs'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }
    },
    rules: {
      '@typescript-eslint/strict-boolean-expressions': [
        2,
        { allowString: false, allowNumber: false }
      ]
    }
  }
)
