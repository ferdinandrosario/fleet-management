require "rails_helper"

RSpec.describe "Api::V1::SuperAdmin::Subscriptions", type: :request do
  let!(:admin) { create(:super_admin) }
  let(:auth_headers) do
    token = JwtService.encode_access(subject: admin.uuid, role: "super_admin", tenant: "public")
    { "Authorization" => "Bearer #{token}" }
  end
  let!(:plan_a) { create(:plan, name: "Plan A") }
  let!(:plan_b) { create(:plan, name: "Plan B") }
  let!(:owner) { create(:owner) }
  let!(:subscription) { create(:subscription, owner: owner, plan: plan_a, status: :active) }

  describe "GET /api/v1/super_admin/subscriptions/:id" do
    it "returns subscription details" do
      get "/api/v1/super_admin/subscriptions/#{subscription.uuid}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["subscription"]["id"]).to eq(subscription.uuid)
      expect(json["data"]["subscription"]["plan"]["name"]).to eq("Plan A")
    end

    it "returns 404 for unknown subscription" do
      get "/api/v1/super_admin/subscriptions/#{SecureRandom.uuid}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /api/v1/super_admin/subscriptions/:id" do
    it "updates subscription status and plan" do
      patch "/api/v1/super_admin/subscriptions/#{subscription.uuid}", params: {
        status: "past_due",
        plan_id: plan_b.uuid,
        razorpay_subscription_id: "sub_123456"
      }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["subscription"]["status"]).to eq("past_due")
      expect(json["data"]["subscription"]["plan"]["name"]).to eq("Plan B")
      expect(json["data"]["subscription"]["razorpay_subscription_id"]).to eq("sub_123456")
    end

    it "returns 404 if updated plan is not found" do
      patch "/api/v1/super_admin/subscriptions/#{subscription.uuid}", params: {
        plan_id: SecureRandom.uuid
      }, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("plan_not_found")
    end

    it "returns 404 if subscription is not found" do
      patch "/api/v1/super_admin/subscriptions/#{SecureRandom.uuid}", params: { status: "active" }, headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns validation error on invalid attributes" do
      create(:subscription, razorpay_subscription_id: "taken_razorpay_id")
      patch "/api/v1/super_admin/subscriptions/#{subscription.uuid}", params: { razorpay_subscription_id: "taken_razorpay_id" }, headers: auth_headers
      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("validation_failed")
    end
  end
end
