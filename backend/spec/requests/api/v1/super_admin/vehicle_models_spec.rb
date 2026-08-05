require "rails_helper"

RSpec.describe "Api::V1::SuperAdmin::VehicleModels", type: :request do
  let!(:admin) { create(:super_admin) }
  let(:auth_headers) do
    token = JwtService.encode_access(subject: admin.uuid, role: "super_admin", tenant: "public")
    { "Authorization" => "Bearer #{token}" }
  end
  let!(:vehicle_model) { create(:vehicle_model, make: "Swaraj", name: "744 FE", category: :tractor) }

  describe "GET /api/v1/super_admin/vehicle_models" do
    it "lists vehicle models" do
      get "/api/v1/super_admin/vehicle_models", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["status"]).to eq("success")
      expect(json["data"]["vehicle_models"]).to be_an(Array)
      expect(json["data"]["pagination"]).to be_present
    end

    it "filters by make and category" do
      create(:vehicle_model, make: "JCB", category: :jcb)
      get "/api/v1/super_admin/vehicle_models", params: { make: "Swaraj", category: "tractor" }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicle_models"].size).to eq(1)
      expect(json["data"]["vehicle_models"].first["make"]).to eq("Swaraj")
    end
  end

  describe "GET /api/v1/super_admin/vehicle_models/:id" do
    it "shows vehicle model detail" do
      get "/api/v1/super_admin/vehicle_models/#{vehicle_model.uuid}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicle_model"]["id"]).to eq(vehicle_model.uuid)
    end

    it "returns 404 for unknown model" do
      get "/api/v1/super_admin/vehicle_models/#{SecureRandom.uuid}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/super_admin/vehicle_models" do
    it "creates a new vehicle model" do
      post "/api/v1/super_admin/vehicle_models", params: {
        make: "Mahindra",
        name: "Arjun 555 DI",
        category: "tractor"
      }, headers: auth_headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicle_model"]["make"]).to eq("Mahindra")
      expect(json["data"]["vehicle_model"]["name"]).to eq("Arjun 555 DI")
      expect(json["data"]["vehicle_model"]["category"]).to eq("tractor")
    end

    it "returns validation errors for invalid data" do
      post "/api/v1/super_admin/vehicle_models", params: {
        make: "",
        name: "Arjun 555 DI",
        category: "tractor"
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("validation_failed")
    end
  end

  describe "PATCH /api/v1/super_admin/vehicle_models/:id" do
    it "updates vehicle model" do
      patch "/api/v1/super_admin/vehicle_models/#{vehicle_model.uuid}", params: {
        name: "744 XT"
      }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicle_model"]["name"]).to eq("744 XT")
    end
    
    it "returns validation errors for invalid data" do
      patch "/api/v1/super_admin/vehicle_models/#{vehicle_model.uuid}", params: {
        make: ""
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 404 for unknown model" do
      patch "/api/v1/super_admin/vehicle_models/#{SecureRandom.uuid}", params: { name: "Test" }, headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/super_admin/vehicle_models/:id" do
    it "deletes vehicle model if not linked" do
      delete "/api/v1/super_admin/vehicle_models/#{vehicle_model.uuid}", headers: auth_headers
      expect(response).to have_http_status(:no_content)
      expect(VehicleModel.find_by(uuid: vehicle_model.uuid)).to be_nil
    end

    it "returns error if linked to existing vehicles" do
      # Note: We simulate linking by creating a vehicle that belongs to this model.
      # Since it's tenant-based, we just test the mock or use a tenant block.
      Apartment::Tenant.switch("public") do
        # Vehicles table does not exist in public, only in tenant schemas
        # Let's mock `vehicle_model.vehicles.exists?` instead of creating a full tenant
        allow_any_instance_of(VehicleModel).to receive_message_chain(:vehicles, :exists?).and_return(true)
        
        delete "/api/v1/super_admin/vehicle_models/#{vehicle_model.uuid}", headers: auth_headers
        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json["error"]["code"]).to eq("cannot_delete")
      end
    end

    it "returns 404 for unknown model" do
      delete "/api/v1/super_admin/vehicle_models/#{SecureRandom.uuid}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
