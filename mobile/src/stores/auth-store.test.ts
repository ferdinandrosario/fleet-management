import * as SecureStore from "expo-secure-store";

import { useAuthStore } from "./auth-store";

const session = { accessToken: "acc", refreshToken: "ref", tenant: "acme" };

describe("auth store", () => {
  beforeEach(async () => {
    // signOut clears both the in-memory secure-store mock and the store state.
    await useAuthStore.getState().signOut();
  });

  it("setTenant pins and persists the tenant before authentication", async () => {
    await useAuthStore.getState().setTenant("acme");
    expect(useAuthStore.getState().tenant).toBe("acme");
    expect(await SecureStore.getItemAsync("fm.tenant")).toBe("acme");
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("signIn persists the session to secure storage and marks authenticated", async () => {
    await useAuthStore.getState().signIn(session);

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.accessToken).toBe("acc");
    expect(state.tenant).toBe("acme");
    expect(await SecureStore.getItemAsync("fm.accessToken")).toBe("acc");
  });

  it("restore rehydrates a persisted session", async () => {
    await SecureStore.setItemAsync("fm.accessToken", "acc");
    await SecureStore.setItemAsync("fm.refreshToken", "ref");
    await SecureStore.setItemAsync("fm.tenant", "acme");

    await useAuthStore.getState().restore();

    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().refreshToken).toBe("ref");
  });

  it("restore with no token is unauthenticated", async () => {
    await useAuthStore.getState().restore();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("signOut clears the session from secure storage", async () => {
    await useAuthStore.getState().signIn(session);
    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(await SecureStore.getItemAsync("fm.accessToken")).toBeNull();
  });
});
