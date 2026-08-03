require "rails_helper"

RSpec.describe "Api::V1::SuperAdmin::Sessions", type: :request do
  let!(:admin) { create(:super_admin, email: "admin@fleet.test", password: "Password123!") }

  describe "POST /api/v1/super_admin/login" do
    context "with valid credentials" do
      it "returns super_admin access token and user info" do
        post "/api/v1/super_admin/login", params: { email: "admin@fleet.test", password: "Password123!" }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["status"]).to eq("success")
        expect(json["data"]["access_token"]).to be_present
        expect(json["data"]["super_admin"]["email"]).to eq("admin@fleet.test")

        payload = JwtService.decode(json["data"]["access_token"])
        expect(payload["role"]).to eq("super_admin")
        expect(payload["tenant"]).to eq("public")
      end
    end

    context "with invalid credentials" do
      it "returns 401 unauthorized" do
        post "/api/v1/super_admin/login", params: { email: "admin@fleet.test", password: "WrongPassword" }

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json["status"]).to eq("error")
        expect(json["error"]["code"]).to eq("invalid_credentials")
      end
    end
  end
end
