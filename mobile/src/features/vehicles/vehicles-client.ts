import { request } from "../../lib/api";

export type VehicleModelCatalogEntry = {
  id: string;
  category: string;
  make: string;
  name: string;
};

export async function fetchVehicleModels() {
  return request<{ vehicle_models: VehicleModelCatalogEntry[] }>("/api/v1/discovery/vehicle_models");
}

export type CreateVehicleRequest = {
  vehicle_model_id: string;
  name: string;
  category: string;
  registration_number: string;
  model_year?: number;
  hourly_rate_paise: number;
  daily_rate_paise: number;
};

export async function createVehicle(data: CreateVehicleRequest) {
  return request<{ vehicle: { uuid: string } }>("/api/v1/vehicles", {
    method: "POST",
    body: data,
  });
}
