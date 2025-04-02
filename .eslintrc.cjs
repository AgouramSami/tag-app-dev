module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "commonjs",
  },
  globals: {
    process: "readonly",
    __dirname: "readonly",
    module: "readonly",
    exports: "readonly",
    require: "readonly",
  },
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": "off",
  },
};
