require "rails_helper"

RSpec.describe "Api::V1::SuperAdmin::Owners", type: :request do
  let!(:admin) { create(:super_admin) }
  let(:auth_headers) do
    token = JwtService.encode_access(subject: admin.uuid, role: "super_admin", tenant: "public")
    { "Authorization" => "Bearer #{token}" }
  end
  let!(:plan) { create(:plan, tier: :basic) }
  let!(:owner) { create(:owner, status: :active) }

  describe "GET /api/v1/super_admin/owners" do
    it "lists owners with pagination" do
      get "/api/v1/super_admin/owners", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["status"]).to eq("success")
      expect(json["data"]["owners"]).to be_an(Array)
      expect(json["data"]["pagination"]).to be_present
    end

    it "filters owners by status" do
      get "/api/v1/super_admin/owners", params: { status: "active" }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["owners"].all? { |o| o["status"] == "active" }).to be true
    end
  end

  describe "GET /api/v1/super_admin/owners/:id" do
    it "shows owner detail" do
      get "/api/v1/super_admin/owners/#{owner.uuid}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["owner"]["id"]).to eq(owner.uuid)
    end

    it "returns 404 for unknown owner" do
      get "/api/v1/super_admin/owners/#{SecureRandom.uuid}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/super_admin/owners" do
    it "provisions a new tenant owner" do
      slug = "new_owner_#{SecureRandom.hex(4)}"

      post "/api/v1/super_admin/owners", params: {
        name: "John Fleet Owner",
        company_name: "New Owner Logistics Pvt Ltd",
        address: "45 Industrial Layout, Hosur Road, Bengaluru",
        slug: slug,
        plan_id: plan.uuid,
        owner_name: "John Owner",
        owner_phone: "+919988776655",
        password: "SuperSecretPassword123!"
      }, headers: auth_headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["owner"]["slug"]).to eq(slug)
      expect(json["data"]["owner"]["name"]).to eq("John Fleet Owner")
      expect(json["data"]["owner"]["company_name"]).to eq("New Owner Logistics Pvt Ltd")
      expect(json["data"]["owner"]["address"]).to eq("45 Industrial Layout, Hosur Road, Bengaluru")

      # Cleanup schema
      Apartment::Tenant.drop(slug) rescue nil
    end

    it "returns 422 if plan is not found" do
      post "/api/v1/super_admin/owners", params: {
        name: "Test",
        slug: "test_slug",
        plan_id: SecureRandom.uuid,
        owner_name: "Owner",
        owner_phone: "+919988776655",
        password: "Pass"
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("plan_not_found")
    end

    it "returns validation errors on invalid tenant parameters" do
      post "/api/v1/super_admin/owners", params: {
        name: "",
        slug: "invalid-slug!",
        plan_tier: "basic",
        owner_name: "Owner",
        owner_phone: "+919988776655",
        password: "Pass"
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("validation_failed")
    end

    it "defaults name and slug to company_name if they are blank" do
      post "/api/v1/super_admin/owners", params: {
        company_name: "Only Business Name Pvt Ltd",
        plan_id: plan.uuid,
        owner_name: "Business Owner",
        owner_phone: "+919988776656",
        password: "SuperSecretPassword123!"
      }, headers: auth_headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["owner"]["name"]).to eq("Only Business Name Pvt Ltd")
      expect(json["data"]["owner"]["company_name"]).to eq("Only Business Name Pvt Ltd")
      expect(json["data"]["owner"]["slug"]).to eq("only_business_name_pvt_ltd")

      Apartment::Tenant.drop("only_business_name_pvt_ltd") rescue nil
    end
  end

  describe "PATCH /api/v1/super_admin/owners/:id" do
    it "updates owner name and company_name" do
      patch "/api/v1/super_admin/owners/#{owner.uuid}", params: {
        name: "Updated Tenant Name",
        company_name: "Updated Business Name Pvt Ltd"
      }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["owner"]["name"]).to eq("Updated Tenant Name")
      expect(json["data"]["owner"]["company_name"]).to eq("Updated Business Name Pvt Ltd")

      owner.reload
      expect(owner.name).to eq("Updated Tenant Name")
      expect(owner.company_name).to eq("Updated Business Name Pvt Ltd")
    end

    it "returns validation errors on invalid update parameters" do
      patch "/api/v1/super_admin/owners/#{owner.uuid}", params: {
        name: ""
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("validation_failed")
    end

    it "returns 404 for unknown owner" do
      patch "/api/v1/super_admin/owners/#{SecureRandom.uuid}", params: { name: "Test" }, headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /api/v1/super_admin/owners/:id/status" do
    it "updates owner status to suspended" do
      patch "/api/v1/super_admin/owners/#{owner.uuid}/status", params: {
        status: "suspended"
      }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["owner"]["status"]).to eq("suspended")
    end

    it "returns unprocessable content for invalid status" do
      patch "/api/v1/super_admin/owners/#{owner.uuid}/status", params: {
        status: "invalid_status"
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("invalid_status")
    end

    it "returns 404 for unknown owner" do
      patch "/api/v1/super_admin/owners/#{SecureRandom.uuid}/status", params: { status: "active" }, headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
