import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { initI18n } from "../lib/i18n";
import { useThemeStore } from "../stores/theme-store";
import { ThemeToggle } from "./theme-toggle";

describe("<ThemeToggle />", () => {
  beforeAll(() => initI18n("en"));

  beforeEach(() => {
    useThemeStore.setState({ mode: "system" });
  });

  it("shows the current mode", async () => {
    const { findByText } = await render(<ThemeToggle />);
    expect(await findByText("Theme: System")).toBeTruthy();
  });

  it("cycles system -> light -> dark -> black -> system on press", async () => {
    const { findByText, getByRole } = await render(<ThemeToggle />);
    await findByText("Theme: System");

    fireEvent.press(getByRole("button"));
    await waitFor(() => expect(useThemeStore.getState().mode).toBe("light"));

    fireEvent.press(getByRole("button"));
    await waitFor(() => expect(useThemeStore.getState().mode).toBe("dark"));

    fireEvent.press(getByRole("button"));
    await waitFor(() => expect(useThemeStore.getState().mode).toBe("black"));
    expect(await findByText("Theme: Black")).toBeTruthy();

    fireEvent.press(getByRole("button"));
    await waitFor(() => expect(useThemeStore.getState().mode).toBe("system"));
  });
});
