require('@rushstack/eslint-patch/modern-module-resolution')
module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
    'plugin:vue/vue3-essential',
  ],
  plugins: ['vue', 'html', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
}
