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
  end
end
