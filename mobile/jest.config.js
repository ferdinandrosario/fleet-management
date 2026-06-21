// Jest runs the suite against both platform presets (jest-expo/ios +
// /android) in one `npm test`, so behavior is exercised on both. Coverage is
// aggregated across projects; the threshold pins are a ratchet (see
// mobile/AGENTS.md "Testing") — raise only after the suite clears the value.
const project = (displayName, preset) => ({
  displayName,
  preset,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(?:jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@react-navigation/.*|react-native-.*|nativewind|react-native-css-interop|@tanstack/.*)",
  ],
});

module.exports = {
  projects: [
    project("ios", "jest-expo/ios"),
    project("android", "jest-expo/android"),
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/test/**", // test-only helpers
  ],
  // Ratchet pins — the highest the suite currently clears (mobile/AGENTS.md).
  // Branches < 100: a few defensive fallbacks (e.g. api.ts's BASE_URL env
  // default) can't trigger in tests.
  coverageThreshold: {
    global: { lines: 100, statements: 100, functions: 100, branches: 96 },
  },
};
