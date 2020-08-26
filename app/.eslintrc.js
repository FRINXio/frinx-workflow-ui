/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

// enforces copyright header to be present in every file
// eslint-disable-next-line max-len

module.exports.extends = ['eslint-config-fbcnms'];
module.exports.overrides = [
  {
    env: {
      node: true,
    },
    files: ['*'],
    rules: {
      'prettier/prettier': [
        2,
        {
          singleQuote: true,
          trailingComma: 'all',
          bracketSpacing: false,
          jsxBracketSameLine: true,
          parser: 'flow',
        },
      ],
    },
  },
  {
    files: ['.eslintrc.js'],
    rules: {
      quotes: ['warn', 'single'],
    },
  },
  {
    env: {
      jest: true,
      node: true,
    },
    files: [
      '**/__mocks__/**/*.js',
      '**/__tests__/**/*.js',
      '**/tests/*.js',
      'testHelpers.js',
      'testData.js',
    ],
  },
  {
    env: {
      node: true,
    },
    files: [
      '.eslintrc.js',
      'babel.config.js',
      'jest.config.js',
      'jest.*.config.js',
      'src/**/*.js'
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/tgnms/**/*.js'],
    rules: {
      // tgnms doesn't want this because there's too many errors
      'flowtype/no-weak-types': 'off',
      'flowtype/require-valid-file-annotation': 'off',
    },
  },
];
module.exports.settings = {
  react: {
    version: 'detect',
  },
};
