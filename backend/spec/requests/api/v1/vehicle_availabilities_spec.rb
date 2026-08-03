require "rails_helper"

RSpec.describe "Api::V1::VehicleAvailabilities", :tenant_schema, type: :request do
  let(:slug) { "test_tenant_avail_req" }

  before { provision_tenant(slug) }
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

  let(:vehicle) { in_tenant(slug) { create(:vehicle) } }

  describe "GET /api/v1/vehicles/:vehicle_id/availabilities" do
    it "lists availabilities for a vehicle" do
      availability = in_tenant(slug) { create(:vehicle_availability, vehicle: vehicle) }

      get "/api/v1/vehicles/#{vehicle.uuid}/availabilities", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["availabilities"].size).to eq(1)
      expect(json["data"]["availabilities"].first["id"]).to eq(availability.uuid)
    end

    it "returns 404 for unknown vehicle" do
      get "/api/v1/vehicles/00000000-0000-0000-0000-000000000000/availabilities", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/vehicles/:vehicle_id/availabilities" do
    it "creates an availability hold" do
      post "/api/v1/vehicles/#{vehicle.uuid}/availabilities", headers: headers, params: {
        start_time: 1.day.from_now.iso8601,
        end_time: 3.days.from_now.iso8601,
        reason: "maintenance"
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["availability"]["reason"]).to eq("maintenance")
    end

    it "returns validation errors on invalid times" do
      post "/api/v1/vehicles/#{vehicle.uuid}/availabilities", headers: headers, params: {
        start_time: 3.days.from_now.iso8601,
        end_time: 1.day.from_now.iso8601
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/vehicles/:vehicle_id/availabilities/:id" do
    it "destroys an availability block" do
      availability = in_tenant(slug) { create(:vehicle_availability, vehicle: vehicle) }

      delete "/api/v1/vehicles/#{vehicle.uuid}/availabilities/#{availability.uuid}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(in_tenant(slug) { VehicleAvailability.find_by(id: availability.id) }).to be_nil
    end

    it "returns 404 for missing availability" do
      delete "/api/v1/vehicles/#{vehicle.uuid}/availabilities/00000000-0000-0000-0000-000000000000", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
