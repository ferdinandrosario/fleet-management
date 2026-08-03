require "rails_helper"

RSpec.describe "Api::V1::SuperAdmin::Plans", type: :request do
  let!(:admin) { create(:super_admin) }
  let(:auth_headers) do
    token = JwtService.encode_access(subject: admin.uuid, role: "super_admin", tenant: "public")
    { "Authorization" => "Bearer #{token}" }
  end
  let!(:plan) { create(:plan, name: "Starter Plan") }

  describe "GET /api/v1/super_admin/plans" do
    it "lists plans when authenticated" do
      get "/api/v1/super_admin/plans", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["status"]).to eq("success")
      expect(json["data"]["plans"].length).to eq(1)
      expect(json["data"]["plans"].first["name"]).to eq("Starter Plan")
    end

    it "returns 401 when unauthorized" do
      get "/api/v1/super_admin/plans"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/super_admin/plans/:id" do
    it "shows plan detail" do
      get "/api/v1/super_admin/plans/#{plan.uuid}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["plan"]["name"]).to eq("Starter Plan")
    end

    it "returns 404 for unknown plan" do
      get "/api/v1/super_admin/plans/#{SecureRandom.uuid}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/super_admin/plans" do
    it "creates a new plan tier" do
      post "/api/v1/super_admin/plans", params: {
        name: "Enterprise Fleet",
        tier: "enterprise",
        interval: "monthly",
        price_paise: 500000,
        limits: { "vehicles" => 50 }
      }, headers: auth_headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["plan"]["name"]).to eq("Enterprise Fleet")
      expect(json["data"]["plan"]["tier"]).to eq("enterprise")
    end

    it "returns validation errors on invalid data" do
      post "/api/v1/super_admin/plans", params: { name: "" }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("validation_failed")
    end
  end

  describe "PATCH /api/v1/super_admin/plans/:id" do
    it "updates an existing plan" do
      patch "/api/v1/super_admin/plans/#{plan.uuid}", params: {
        price_paise: 150000
      }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["plan"]["price_paise"]).to eq(150000)
    end

    it "returns 404 for unknown plan" do
      patch "/api/v1/super_admin/plans/#{SecureRandom.uuid}", params: { price_paise: 100 }, headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns validation error on invalid attributes" do
      patch "/api/v1/super_admin/plans/#{plan.uuid}", params: { price_paise: -10 }, headers: auth_headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
