import { fireEvent, render } from "@testing-library/react-native";

import { Button } from "./button";

describe("Button", () => {
  it("renders its title", async () => {
    const { getByText } = await render(<Button title="Book now" />);
    expect(getByText("Book now")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button title="Tap" onPress={onPress} />);
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress while disabled", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button title="Nope" onPress={onPress} disabled />);
    fireEvent.press(getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
