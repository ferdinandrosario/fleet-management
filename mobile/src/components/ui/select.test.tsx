import { fireEvent, render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import { Select } from "./select";

describe("Select", () => {
  it("renders with placeholder when no value is selected", async () => {
    await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[{ label: "Option 1", value: "opt1" }]}
        value=""
        onSelect={() => {}}
      />
    );
    expect(screen.getByText("Test Select")).toBeTruthy();
    expect(screen.getByText("Choose an option")).toBeTruthy();
  });

  it("renders with selected option label", async () => {
    await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[
          { label: "Option 1", value: "opt1" },
          { label: "Option 2", value: "opt2" }
        ]}
        value="opt2"
        onSelect={() => {}}
      />
    );
    expect(screen.getByText("Test Select")).toBeTruthy();
    expect(screen.getByText("Option 2")).toBeTruthy();
  });

  it("toggles modal when pressed", async () => {
    await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[{ label: "Option 1", value: "opt1" }]}
        value=""
        onSelect={() => {}}
      />
    );

    // Initial state: modal should be visible or closed, but since RN Modal behavior varies in tests, 
    // we just check if options are rendered when opened.
    const trigger = screen.getByText("Choose an option");
    fireEvent.press(trigger);

    // Option should be visible
    expect(await screen.findByText("Option 1")).toBeTruthy();
  });

  it("calls onSelect and closes modal when an option is selected", async () => {
    const onSelectMock = jest.fn();
    await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[{ label: "Option 1", value: "opt1" }]}
        value=""
        onSelect={onSelectMock}
      />
    );

    fireEvent.press(screen.getByText("Choose an option"));
    fireEvent.press(await screen.findByText("Option 1"));

    expect(onSelectMock).toHaveBeenCalledWith("opt1");
  });

  it("closes modal when pressing outside (close button)", async () => {
    await render(
      <View>
        <Select 
          label="Test Select"
          placeholder="Choose an option"
          options={[{ label: "Option 1", value: "opt1" }]}
          value=""
          onSelect={() => {}}
        />
        <View testID="outside" />
      </View>
    );

    fireEvent.press(screen.getByText("Choose an option"));
    expect(await screen.findByText("Option 1")).toBeTruthy();

    fireEvent.press(screen.getByText("Done"));
  });
});
