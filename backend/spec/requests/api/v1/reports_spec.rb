require "rails_helper"

RSpec.describe "Api::V1::Reports", :tenant_schema, type: :request do
  let(:slug) { "rpt_req_#{SecureRandom.hex(4)}" }
  let(:plan) { create(:plan) }

  before do
    provision_tenant(slug)
    Apartment::Tenant.reset
    owner = Owner.find_by!(slug: slug)
    owner.active!
    create(:subscription, owner: owner, plan: plan, status: :active)
  end

  after { drop_tenant(slug) }

  let(:admin_user) do
    in_tenant(slug) { create(:user, role: :owner_admin) }
  end

  let(:admin_headers) do
    token = JwtService.encode_access(subject: admin_user.uuid, role: "owner_admin", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  describe "GET /api/v1/reports/dashboard" do
    it "returns dashboard metrics for owner admin" do
      get "/api/v1/reports/dashboard", headers: admin_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["dashboard"]["total_vehicles_count"]).to eq(0)
    end
  end

  describe "GET /api/v1/reports/bookings_csv" do
    it "exports bookings as CSV file" do
      get "/api/v1/reports/bookings_csv", headers: admin_headers

      expect(response).to have_http_status(:ok)
      expect(response.headers["Content-Type"]).to include("text/csv")
      expect(response.body).to include("Booking ID,Customer,Vehicle,Driver")
    end
  end
end
