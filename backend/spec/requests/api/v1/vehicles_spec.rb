require "rails_helper"

RSpec.describe "Api::V1::Vehicles", :tenant_schema, type: :request do
  let(:slug) { "veh_tenant_#{SecureRandom.hex(4)}" }
  let(:plan) { create(:plan, limits: { "vehicles" => 5 }) }

  before do
    provision_tenant(slug)
    Apartment::Tenant.reset
    owner = Owner.find_by!(slug: slug)
    owner.active!
    create(:subscription, owner: owner, plan: plan, status: :active)
  end

  after { drop_tenant(slug) }

  let(:owner_user) do
    in_tenant(slug) do
      create(:user, role: :owner_admin)
    end
  end

  let(:token) { JwtService.encode_access(subject: owner_user.uuid, role: "owner_admin", tenant: slug) }
  let(:headers) do
    {
      "Authorization" => "Bearer #{token}",
      "X-Tenant" => slug
    }
  end

  describe "GET /api/v1/vehicles" do
    it "lists tenant vehicles with pagination and filters" do
      v1 = in_tenant(slug) { create(:vehicle, category: :tractor, status: :available) }

      get "/api/v1/vehicles", headers: headers, params: { category: "tractor" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicles"].size).to eq(1)
      expect(json["data"]["vehicles"].first["id"]).to eq(v1.uuid)
    end
  end

  describe "GET /api/v1/vehicles/:id" do
    it "shows vehicle details" do
      vehicle = in_tenant(slug) { create(:vehicle) }

      get "/api/v1/vehicles/#{vehicle.uuid}", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicle"]["id"]).to eq(vehicle.uuid)
    end

    it "returns 404 for unknown vehicle uuid" do
      get "/api/v1/vehicles/00000000-0000-0000-0000-000000000000", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/vehicles" do
    it "creates a new vehicle listing when plan limit permits" do
      post "/api/v1/vehicles", headers: headers, params: {
        name: "JCB 3DX Super",
        category: "jcb",
        registration_number: "TN-09-CB-9999",
        model_year: 2023,
        hourly_rate_paise: 80000,
        daily_rate_paise: 600000
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicle"]["name"]).to eq("JCB 3DX Super")
    end

    it "returns plan_limit_exceeded when owner reached vehicle quota" do
      plan.update!(limits: { "vehicles" => 0 })

      post "/api/v1/vehicles", headers: headers, params: {
        name: "Exceeded Vehicle",
        category: "tractor",
        registration_number: "TN-01-XX-0000",
        hourly_rate_paise: 50000
      }

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("plan_limit_exceeded")
    end

    it "returns validation errors on invalid attributes" do
      post "/api/v1/vehicles", headers: headers, params: { name: "" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/vehicles/:id" do
    it "updates vehicle details" do
      vehicle = in_tenant(slug) { create(:vehicle) }

      patch "/api/v1/vehicles/#{vehicle.uuid}", headers: headers, params: { name: "Updated Name" }

      expect(response).to have_http_status(:ok)
      expect(in_tenant(slug) { vehicle.reload.name }).to eq("Updated Name")
    end

    it "returns 404 on update when vehicle is missing" do
      patch "/api/v1/vehicles/00000000-0000-0000-0000-000000000000", headers: headers, params: { name: "Updated" }

      expect(response).to have_http_status(:not_found)
    end

    it "returns validation errors on invalid update attributes" do
      vehicle = in_tenant(slug) { create(:vehicle) }

      patch "/api/v1/vehicles/#{vehicle.uuid}", headers: headers, params: { registration_number: "" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/vehicles/:id" do
    it "archives/inactivates the vehicle" do
      vehicle = in_tenant(slug) { create(:vehicle, status: :available) }

      delete "/api/v1/vehicles/#{vehicle.uuid}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(in_tenant(slug) { vehicle.reload.status }).to eq("inactive")
    end

    it "returns 404 on delete when vehicle is missing" do
      delete "/api/v1/vehicles/00000000-0000-0000-0000-000000000000", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /api/v1/vehicles/:id/quote" do
    it "calculates rental price quote" do
      vehicle = in_tenant(slug) { create(:vehicle, hourly_rate_paise: 50000, daily_rate_paise: 350000) }

      get "/api/v1/vehicles/#{vehicle.uuid}/quote", headers: headers, params: { hours: 5, days: 0 }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["final_paise"]).to eq(250000)
    end

    it "returns 404 on quote when vehicle is missing" do
      get "/api/v1/vehicles/00000000-0000-0000-0000-000000000000/quote", headers: headers, params: { hours: 5 }

      expect(response).to have_http_status(:not_found)
    end
  end
end
