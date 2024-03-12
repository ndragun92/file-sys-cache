module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  ignorePatterns: ['dist/', 'node_modules/', 'src/**.spec.ts', 'coverage/', 'docs/', '_docs'],
  extends: 'standard-with-typescript',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": "off",
    "no-useless-catch": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "import/no-named-default": "warn"
  }
}
