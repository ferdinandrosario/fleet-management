require "rails_helper"

RSpec.describe "Api::V1::SuperAdmin::Dashboards", type: :request do
  let(:super_admin) { create(:super_admin) }
  let(:headers) do
    token = JwtService.encode_access(subject: super_admin.uuid, role: "super_admin", tenant: "public")
    { "Authorization" => "Bearer #{token}" }
  end

  describe "GET /api/v1/super_admin/dashboard" do
    it "returns platform dashboard metrics for super_admin" do
      get "/api/v1/super_admin/dashboard", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["dashboard"]["total_owners_count"]).to be >= 0
    end
  end
end
