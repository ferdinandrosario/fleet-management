require "rails_helper"

RSpec.describe "Api::V1::Health", type: :request do
  describe "GET /api/v1/health" do
    it "returns the standard success envelope with service status" do
      get "/api/v1/health"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body["status"]).to eq("success")
      expect(body["data"]["service"]).to eq("fleet-management-api")
      expect(body["data"]["status"]).to eq("ok")
      expect(body["data"]).to have_key("system_info")
      expect(body["error"]).to be_nil
    end
  end
end
