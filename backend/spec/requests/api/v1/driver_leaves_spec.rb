require "rails_helper"

RSpec.describe "Api::V1::DriverLeaves", :tenant_schema, type: :request do
  let(:slug) { "lve_req_#{SecureRandom.hex(4)}" }
  let(:plan) { create(:plan) }

  before do
    provision_tenant(slug)
    Apartment::Tenant.reset
    owner = Owner.find_by!(slug: slug)
    owner.active!
    create(:subscription, owner: owner, plan: plan, status: :active)
  end

  after { drop_tenant(slug) }

  let(:driver_user) do
    in_tenant(slug) { create(:user, role: :driver) }
  end

  let(:admin_user) do
    in_tenant(slug) { create(:user, role: :owner_admin) }
  end

  let(:driver_headers) do
    token = JwtService.encode_access(subject: driver_user.uuid, role: "driver", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  let(:admin_headers) do
    token = JwtService.encode_access(subject: admin_user.uuid, role: "owner_admin", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  describe "GET /api/v1/driver_leaves" do
    it "lists driver leaves for logged-in driver" do
      in_tenant(slug) { create(:driver_leave, driver: driver_user) }

      get "/api/v1/driver_leaves", headers: driver_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["leaves"].size).to eq(1)
    end
  end

  describe "POST /api/v1/driver_leaves" do
    it "applies for driver leave" do
      post "/api/v1/driver_leaves", headers: driver_headers, params: {
        start_date: Date.current,
        end_date: Date.current + 2.days,
        reason: "Personal work"
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["leave"]["status"]).to eq("pending")
    end

    it "returns unprocessable_content on invalid dates" do
      post "/api/v1/driver_leaves", headers: driver_headers, params: {
        start_date: Date.current,
        end_date: Date.current - 1.day
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/driver_leaves/:id/status" do
    let(:leave) { in_tenant(slug) { create(:driver_leave, driver: driver_user) } }

    it "approves leave application when requested by owner_admin" do
      patch "/api/v1/driver_leaves/#{leave.uuid}/status", headers: admin_headers, params: {
        status: "approved"
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["leave"]["status"]).to eq("approved")
    end

    it "returns 404 for unknown leave" do
      patch "/api/v1/driver_leaves/00000000-0000-0000-0000-000000000000/status", headers: admin_headers, params: {
        status: "approved"
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on invalid status" do
      patch "/api/v1/driver_leaves/#{leave.uuid}/status", headers: admin_headers, params: {
        status: "invalid_status"
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
