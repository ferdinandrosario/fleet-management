import { request } from "../../lib/api";
import { createVehicle, fetchVehicleModels } from "./vehicles-client";

jest.mock("../../lib/api", () => ({
  request: jest.fn(),
}));

describe("vehicles-client", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchVehicleModels", () => {
    it("calls request with correct endpoint", async () => {
      (request as jest.Mock).mockResolvedValueOnce({ vehicle_models: [] });
      await fetchVehicleModels();
      expect(request).toHaveBeenCalledWith("/api/v1/discovery/vehicle_models");
    });
  });

  describe("createVehicle", () => {
    it("calls request with correct endpoint and payload", async () => {
      (request as jest.Mock).mockResolvedValueOnce({ vehicle: { uuid: "v_123" } });
      const payload = {
        vehicle_model_id: "m_1",
        name: "Test Vehicle",
        category: "Test Category",
        registration_number: "TEST-123",
        hourly_rate_cents: 1000,
        daily_rate_cents: 5000,
      };
      await createVehicle(payload);
      expect(request).toHaveBeenCalledWith("/api/v1/vehicles", {
        method: "POST",
        body: payload,
      });
    });
  });
});
