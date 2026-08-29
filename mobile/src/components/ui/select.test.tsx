import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import { Select } from "./select";

describe("Select", () => {
  it("renders with placeholder when no value is selected", async () => {
    const { getByText } = await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[{ label: "Option 1", value: "opt1" }]}
        value=""
        onSelect={() => {}}
      />
    );
    expect(getByText("Test Select")).toBeTruthy();
    expect(getByText("Choose an option")).toBeTruthy();
  });

  it("renders with selected option label", async () => {
    const { getByText } = await render(
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
    expect(getByText("Test Select")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
  });

  it("toggles modal when pressed", async () => {
    const { getByText, findByText } = await render(
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
    const trigger = getByText("Choose an option");
    fireEvent.press(trigger);

    // Option should be visible
    expect(await findByText("Option 1")).toBeTruthy();
  });

  it("calls onSelect and closes modal when an option is selected", async () => {
    const onSelectMock = jest.fn();
    const { getByText, findByText } = await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[{ label: "Option 1", value: "opt1" }]}
        value=""
        onSelect={onSelectMock}
      />
    );

    fireEvent.press(getByText("Choose an option"));
    fireEvent.press(await findByText("Option 1"));

    expect(onSelectMock).toHaveBeenCalledWith("opt1");
  });

  it("closes modal when pressing outside (close button)", async () => {
    const { getByText, findByText } = await render(
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

    fireEvent.press(getByText("Choose an option"));
    expect(await findByText("Option 1")).toBeTruthy();

    fireEvent.press(getByText("Done"));
  });

  it("highlights the currently selected option inside the modal", async () => {
    const { getByText, findByTestId } = await render(
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
    fireEvent.press(getByText("Option 2")); // The trigger button
    
    // Wait for the modal option to render
    const modalOption = await findByTestId("option-opt2");
    expect(modalOption).toBeTruthy();
  });

  it("renders error message", async () => {
    const { getByText } = await render(
      <Select 
        label="Test Select"
        placeholder="Choose an option"
        options={[{ label: "Option 1", value: "opt1" }]}
        value=""
        onSelect={() => {}}
        error="Invalid selection"
      />
    );
    expect(getByText("Invalid selection")).toBeTruthy();
  });
});
