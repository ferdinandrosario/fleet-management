require "rails_helper"

RSpec.describe "Api::V1::PricingRules", :tenant_schema, type: :request do
  let(:slug) { "test_tenant_price_req" }

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

  describe "GET /api/v1/vehicles/:vehicle_id/pricing_rules" do
    it "lists pricing rules for a vehicle" do
      rule = in_tenant(slug) { create(:pricing_rule, vehicle: vehicle) }

      get "/api/v1/vehicles/#{vehicle.uuid}/pricing_rules", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["rules"].size).to eq(1)
      expect(json["data"]["rules"].first["id"]).to eq(rule.uuid)
    end

    it "returns 404 for missing vehicle" do
      get "/api/v1/vehicles/00000000-0000-0000-0000-000000000000/pricing_rules", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/vehicles/:vehicle_id/pricing_rules" do
    it "creates a pricing rule" do
      post "/api/v1/vehicles/#{vehicle.uuid}/pricing_rules", headers: headers, params: {
        min_duration_hours: 24,
        discount_percentage: 15.0,
        active: true
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["rule"]["min_duration_hours"]).to eq(24)
      expect(json["data"]["rule"]["discount_percentage"]).to eq(15.0)
    end

    it "returns validation errors on invalid discount percentage" do
      post "/api/v1/vehicles/#{vehicle.uuid}/pricing_rules", headers: headers, params: {
        min_duration_hours: 5,
        discount_percentage: 150.0
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/vehicles/:vehicle_id/pricing_rules/:id" do
    it "destroys a pricing rule" do
      rule = in_tenant(slug) { create(:pricing_rule, vehicle: vehicle) }

      delete "/api/v1/vehicles/#{vehicle.uuid}/pricing_rules/#{rule.uuid}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(in_tenant(slug) { PricingRule.find_by(id: rule.id) }).to be_nil
    end

    it "returns 404 for missing pricing rule" do
      delete "/api/v1/vehicles/#{vehicle.uuid}/pricing_rules/00000000-0000-0000-0000-000000000000", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
