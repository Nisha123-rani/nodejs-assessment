import { FlatCompat } from "eslint-define-config";

const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  ...compat.extends("eslint:recommended"),
  {
    files: ["src/**/*.js"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];

