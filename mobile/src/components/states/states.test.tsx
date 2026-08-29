import { fireEvent, render } from "@testing-library/react-native";
import { useColorScheme } from "nativewind";

import { initI18n } from "../../lib/i18n";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import { OfflineState } from "./offline-state";

jest.mock("nativewind", () => ({
  useColorScheme: jest.fn(),
}));

describe("state views", () => {
  beforeAll(() => {
    initI18n("en");
  });

  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue({ colorScheme: "light" });
  });

  it("LoadingState shows the loading label", async () => {
    const { getByText } = await render(<LoadingState />);
    expect(getByText("Loading…")).toBeTruthy();
  });

  it("EmptyState shows the title and an optional body", async () => {
    const { getByText } = await render(<EmptyState body="No vehicles found" />);
    expect(getByText("Nothing here yet")).toBeTruthy();
    expect(getByText("No vehicles found")).toBeTruthy();
  });

  it("EmptyState without a body renders only the title", async () => {
    const { getByText, queryByText } = await render(<EmptyState />);
    expect(getByText("Nothing here yet")).toBeTruthy();
    expect(queryByText("No vehicles found")).toBeNull();
  });

  it("ErrorState fires onRetry from its retry action", async () => {
    const onRetry = jest.fn();
    const { getByRole } = await render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(getByRole("button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("ErrorState without onRetry shows no action", async () => {
    const { queryByRole } = await render(<ErrorState />);
    expect(queryByRole("button")).toBeNull();
  });

  it("OfflineState shows title, body, and retry", async () => {
    const onRetry = jest.fn();
    const { getByText, getByRole } = await render(<OfflineState onRetry={onRetry} />);
    expect(getByText("You're offline")).toBeTruthy();
    expect(getByText("Check your connection and try again.")).toBeTruthy();
    fireEvent.press(getByRole("button"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("OfflineState without onRetry shows no action", async () => {
    const { queryByRole } = await render(<OfflineState />);
    expect(queryByRole("button")).toBeNull();
  });
});

describe("state views dark mode", () => {
  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue({ colorScheme: "dark" });
  });

  it("LoadingState renders in dark mode without crashing", async () => {
    const { getByText } = await render(<LoadingState />);
    expect(getByText("Loading…")).toBeTruthy();
  });
});
