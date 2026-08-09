import React from "react";
import { fireEvent, waitFor, cleanup, render } from "@testing-library/react-native";
import { navProp, createTestQueryClient } from "../../test/test-utils";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { AddVehicleScreen } from "./add-vehicle-screen";
import * as vehiclesClient from "./vehicles-client";

jest.mock("./vehicles-client", () => ({
  fetchVehicleModels: jest.fn(),
  createVehicle: jest.fn(),
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe("AddVehicleScreen", () => {
  const fetchVehicleModelsMock = vehiclesClient.fetchVehicleModels as jest.Mock;
  const createVehicleMock = vehiclesClient.createVehicle as jest.Mock;

  const getQueryClientWithModels = () => {
    const client = createTestQueryClient();
    client.setQueryData(["vehicle_models"], {
      ok: true,
      data: {
        vehicle_models: [
          { id: "1", category: "Tractor", make: "Mahindra", name: "Mahindra 265 DI" },
          { id: "2", category: "Tractor", make: "Swaraj", name: "Swaraj 744 XT" },
        ],
      },
    });
    return client;
  };

  const renderScreen = (nav = navProp(), client = getQueryClientWithModels()) =>
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <QueryClientProvider client={client}>
          <AddVehicleScreen navigation={nav} route={{} as never} />
        </QueryClientProvider>
      </SafeAreaProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    fetchVehicleModelsMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          vehicle_models: [
            { id: "1", category: "Tractor", make: "Mahindra", name: "Mahindra 265 DI" },
            { id: "2", category: "Tractor", make: "Swaraj", name: "Swaraj 744 XT" },
          ],
        },
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the screen and loads vehicle models", async () => {
    const { getByText, findByTestId } = await renderScreen();

    // Verify title
    expect(getByText("Add Vehicle")).toBeTruthy();

    // Select category
    const selectCat = await findByTestId("select-category");
    await fireEvent.press(selectCat);
    await fireEvent.press(await findByTestId("option-Tractor"));

    // Verify dependent dropdown updated
    expect(await findByTestId("select-make")).toBeTruthy();
  });

  it("shows validation error if required fields are missing", async () => {
    const { getByText, findByTestId } = await renderScreen();
    await findByTestId("select-category"); // wait for initial load
    await fireEvent.press(getByText("Save Vehicle"));

    await waitFor(() => {
      expect(getByText("Please fill all required fields.")).toBeTruthy();
    });
  });

  it("submits the form successfully and navigates back", async () => {
    createVehicleMock.mockResolvedValueOnce({ ok: true, data: { vehicle: { uuid: "v_123" } } });
    const mockNavigate = jest.fn();
    const mockGoBack = jest.fn();

    const { getByText, findByTestId, getByPlaceholderText } = await renderScreen(
      navProp(mockNavigate, mockGoBack)
    );

    // Wait for initial load
    const selectCat = await findByTestId("select-category");

    // Select category -> make -> variety
    await fireEvent.press(selectCat);
    await fireEvent.press(await findByTestId("option-Tractor"));

    await fireEvent.press(await findByTestId("select-make"));
    await fireEvent.press(await findByTestId("option-Mahindra"));

    await fireEvent.press(await findByTestId("select-variety"));
    await fireEvent.press(await findByTestId("option-1"));

    // Fill text inputs
    await fireEvent.changeText(getByPlaceholderText("e.g. Tata Ace Gold #1"), "My Tractor");
    await fireEvent.changeText(getByPlaceholderText("e.g. MH12AB1234"), "MH121234");
    await fireEvent.changeText(getByPlaceholderText("e.g. 500"), "500");
    await fireEvent.changeText(getByPlaceholderText("e.g. 4000"), "4000");
    await fireEvent.changeText(getByPlaceholderText("e.g. 2022"), "2023");

    // Submit
    await waitFor(() => {
      expect(getByText("Save Vehicle")).not.toBeDisabled();
    });
    await fireEvent.press(getByText("Save Vehicle"));

    await waitFor(() => {
      expect(createVehicleMock).toHaveBeenCalledWith({
        vehicle_model_id: "1",
        name: "My Tractor",
        category: "Tractor",
        registration_number: "MH121234",
        hourly_rate_paise: 50000,
        daily_rate_paise: 400000,
        model_year: 2023,
      });
    });

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("displays server error message on failure", async () => {
    createVehicleMock.mockResolvedValueOnce({ ok: false, error: { message: "Server error" } });

    const { getByText, findByTestId, getByPlaceholderText } = await renderScreen();

    // Wait for initial load
    const selectCat = await findByTestId("select-category");

    // Select category -> make -> variety
    await fireEvent.press(selectCat);
    await fireEvent.press(await findByTestId("option-Tractor"));

    await fireEvent.press(await findByTestId("select-make"));
    await fireEvent.press(await findByTestId("option-Mahindra"));

    await fireEvent.press(await findByTestId("select-variety"));
    await fireEvent.press(await findByTestId("option-1"));

    // Fill text inputs
    await fireEvent.changeText(getByPlaceholderText("e.g. Tata Ace Gold #1"), "My Tractor");
    await fireEvent.changeText(getByPlaceholderText("e.g. MH12AB1234"), "MH121234");
    await fireEvent.changeText(getByPlaceholderText("e.g. 500"), "500");
    await fireEvent.changeText(getByPlaceholderText("e.g. 4000"), "4000");
    await fireEvent.changeText(getByPlaceholderText("e.g. 2022"), "2023");

    // Submit
    await waitFor(() => {
      expect(getByText("Save Vehicle")).not.toBeDisabled();
    });
    await fireEvent.press(getByText("Save Vehicle"));

    await waitFor(() => {
      expect(getByText("Server error")).toBeTruthy();
    });
  });

  it("displays unexpected error message when vehicle creation rejects", async () => {
    createVehicleMock.mockRejectedValueOnce(new Error("Network error"));

    const { getByText, findByTestId, getByPlaceholderText } = await renderScreen();

    // Wait for initial load
    const selectCat = await findByTestId("select-category");

    // Select category -> make -> variety
    await fireEvent.press(selectCat);
    await fireEvent.press(await findByTestId("option-Tractor"));

    await fireEvent.press(await findByTestId("select-make"));
    await fireEvent.press(await findByTestId("option-Mahindra"));

    await fireEvent.press(await findByTestId("select-variety"));
    await fireEvent.press(await findByTestId("option-1"));

    // Fill text inputs
    await fireEvent.changeText(getByPlaceholderText("e.g. Tata Ace Gold #1"), "My Tractor");
    await fireEvent.changeText(getByPlaceholderText("e.g. MH12AB1234"), "MH121234");
    await fireEvent.changeText(getByPlaceholderText("e.g. 500"), "500");
    await fireEvent.changeText(getByPlaceholderText("e.g. 4000"), "4000");
    await fireEvent.changeText(getByPlaceholderText("e.g. 2022"), "2023");

    // Submit
    await waitFor(() => {
      expect(getByText("Save Vehicle")).not.toBeDisabled();
    });
    await fireEvent.press(getByText("Save Vehicle"));

    await waitFor(() => {
      expect(getByText("An unexpected error occurred.")).toBeTruthy();
    });
  });
});
