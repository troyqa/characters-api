import tseslint from 'typescript-eslint';
import baseConfig from '@peculiar/eslint-config-base';
import globals from 'globals';

export default tseslint.config(
  ...baseConfig,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
);
