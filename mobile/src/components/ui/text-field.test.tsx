import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { TextField } from "./text-field";
import { palette } from "../../theme/tokens";

// Mock NativeWind's useColorScheme
jest.mock("nativewind", () => ({
  useColorScheme: () => ({ colorScheme: "light" }),
}));

describe("TextField", () => {
  it("renders with label and placeholder", async () => {
    const { getByText, getByPlaceholderText } = await render(
      <TextField label="Email" value="" onChangeText={() => {}} placeholder="Enter email" />
    );
    expect(getByText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Enter email")).toBeTruthy();
  });

  it("calls onChangeText when user types", async () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = await render(
      <TextField label="Email" value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByLabelText("Email"), "test@example.com");
    expect(onChangeText).toHaveBeenCalledWith("test@example.com");
  });

  it("handles focus and blur states", async () => {
    const { getByLabelText } = await render(
      <TextField label="Email" value="" onChangeText={() => {}} />
    );
    const colors = palette("light");
    const input = getByLabelText("Email");

    // Default border color is colors.line
    expect(getByLabelText("Email").props.style.borderColor).toBe(colors.line);

    // Focus sets border to colors.brand
    await act(() => {
      input.props.onFocus();
    });
    expect(getByLabelText("Email").props.style.borderColor).toBe(colors.brand);

    // Blur sets border back to colors.line
    await act(() => {
      input.props.onBlur();
    });
    expect(getByLabelText("Email").props.style.borderColor).toBe(colors.line);
  });

  it("renders error message and sets error border", async () => {
    const { getByText, getByLabelText } = await render(
      <TextField label="Email" value="" onChangeText={() => {}} error="Invalid email" />
    );
    const colors = palette("light");

    expect(getByText("Invalid email")).toBeTruthy();
    // Error takes priority over focus/blur, so border should be colors.danger
    expect(getByLabelText("Email").props.style.borderColor).toBe(colors.danger);
  });
});
