require "rails_helper"

RSpec.describe "Api::V1::Discovery::VehicleModels", type: :request do
  let!(:active_model) { create(:vehicle_model, make: "Swaraj", name: "744 FE", category: :tractor, active: true) }
  let!(:inactive_model) { create(:vehicle_model, make: "Mahindra", name: "Old Tractor", category: :tractor, active: false) }

  describe "GET /api/v1/discovery/vehicle_models" do
    it "lists active vehicle models without authentication" do
      get "/api/v1/discovery/vehicle_models"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["status"]).to eq("success")
      
      models = json["data"]["vehicle_models"]
      expect(models).to be_an(Array)
      expect(models.length).to eq(1)
      expect(models.first["name"]).to eq("744 FE")
      expect(models.first["make"]).to eq("Swaraj")
      expect(models.first["category"]).to eq("tractor")
    end

    it "filters by category" do
      create(:vehicle_model, make: "JCB", category: :jcb, active: true)
      get "/api/v1/discovery/vehicle_models", params: { category: "jcb" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      models = json["data"]["vehicle_models"]
      expect(models.length).to eq(1)
      expect(models.first["make"]).to eq("JCB")
    end
    
    it "filters by make" do
      create(:vehicle_model, make: "Mahindra", name: "New Tractor", category: :tractor, active: true)
      get "/api/v1/discovery/vehicle_models", params: { make: "Mahindra" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      models = json["data"]["vehicle_models"]
      expect(models.length).to eq(1)
      expect(models.first["name"]).to eq("New Tractor")
    end
  end
end
