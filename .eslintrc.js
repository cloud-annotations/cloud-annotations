const allExtensions = [".ts", ".tsx", ".d.ts", ".js", ".jsx"];

module.exports = {
  root: true,
  extends: [
    "react-app",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
  ],
  plugins: ["import", "header"],
  rules: {
    "testing-library/prefer-screen-queries": ["warn"],
    "jest/no-large-snapshots": ["warn", { maxSize: 20 }],
    "jest/expect-expect": ["off"],
    "jest/valid-title": ["off"],
    "header/header": [
      "warn",
      "block",
      [
        "",
        " * Copyright (c) 2020 International Business Machines",
        " *",
        " * This source code is licensed under the MIT license found in the",
        " * LICENSE file in the root directory of this source tree.",
        " ",
      ],
      2,
    ],
    "import/newline-after-import": ["warn", { count: 1 }],
    "import/no-extraneous-dependencies": [
      "warn",
      {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: true,
        bundledDependencies: true,
      },
    ],
    "import/order": [
      "warn",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "always",
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
          "object",
        ],
        pathGroups: [
          {
            pattern: "react?(-dom)",
            group: "external",
            position: "before",
          },
          {
            pattern: "@iris/**",
            group: "external",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
      },
    ],
  },
  overrides: [
    {
      files: ["cypress/**"],
      rules: {
        "testing-library/prefer-screen-queries": "off",
      },
    },
    {
      files: ["stories/**"],
      rules: {
        "import/no-anonymous-default-export": ["off"],
        "import/no-extraneous-dependencies": "off",
      },
    },
    {
      files: [
        "webpack.*.js",
        "*.test.{ts,tsx}",
        "test-utils.{ts,tsx}",
        "cypress/**",
      ],
      rules: {
        "import/no-extraneous-dependencies": [
          "warn",
          {
            devDependencies: true,
            optionalDependencies: false,
            peerDependencies: false,
            bundledDependencies: true,
          },
        ],
      },
    },
  ],
  settings: {
    "import/extensions": allExtensions,
    "import/external-module-folders": ["node_modules", "node_modules/@types"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".d.ts"],
    },
    "import/resolver": {
      node: {
        extensions: allExtensions,
      },
    },
  },
};
