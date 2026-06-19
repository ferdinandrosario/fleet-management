// Expo's shipped ESLint flat config (mobile/AGENTS.md). No Prettier.
const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: ["dist/*", "coverage/*", "node_modules/*", ".expo/*"],
  },
];
