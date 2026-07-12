import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// Expo public env vars are read at module load (mobile/AGENTS.md "Testing"),
// so set them here, before any module captures them.
process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

// Secure storage is native — mock it with an in-memory map so the auth session
// store is testable without a device Keychain/Keystore.
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
  };
});

// expo-localization is native; default to a stable device locale in tests.
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en", languageTag: "en-US" }],
}));

// AsyncStorage is native — the official in-memory mock backs the theme store.
// The `mock` prefix lets babel-plugin-jest-hoist allow the out-of-scope
// reference inside the hoisted factory.
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
