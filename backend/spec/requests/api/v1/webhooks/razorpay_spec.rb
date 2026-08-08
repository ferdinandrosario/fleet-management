require "rails_helper"

RSpec.describe "Api::V1::Webhooks::Razorpay", type: :request do
  describe "POST /api/v1/webhooks/razorpay" do
    let(:valid_payload) do
      {
        event: "subscription.charged",
        payload: {
          subscription: {
            entity: { id: "sub_123", status: "active" }
          }
        }
      }
    end

    it "processes the webhook successfully and returns 200 OK" do
      post "/api/v1/webhooks/razorpay", params: valid_payload, as: :json

      expect(response).to have_http_status(:ok)
    end

    it "returns unprocessable_content if the service fails" do
      allow(RazorpayWebhookService).to receive(:call).and_return(
        RazorpayWebhookService::Result.new(success: false, errors: { base: [ "error" ] })
      )

      post "/api/v1/webhooks/razorpay", params: valid_payload, as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    context "with HMAC signature verification" do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with("RAZORPAY_WEBHOOK_SECRET").and_return("test_secret")
      end

      it "accepts valid HMAC signature" do
        payload_json = valid_payload.to_json
        signature = OpenSSL::HMAC.hexdigest("SHA256", "test_secret", payload_json)

        post "/api/v1/webhooks/razorpay", params: payload_json, headers: { "HTTP_X_RAZORPAY_SIGNATURE" => signature, "CONTENT_TYPE" => "application/json" }
        expect(response).to have_http_status(:ok)
      end

      it "rejects invalid HMAC signature" do
        post "/api/v1/webhooks/razorpay", params: valid_payload.to_json, headers: { "HTTP_X_RAZORPAY_SIGNATURE" => "invalid", "CONTENT_TYPE" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "in production without signature" do
      it "returns 401 unauthorized if in production" do
        allow(Rails.env).to receive(:production?).and_return(true)
        post "/api/v1/webhooks/razorpay", params: valid_payload, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
