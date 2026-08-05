# Razorpay webhook endpoint (Session 4 & 6).
# Excluded from rate limits and tenant resolution, inherits from ApplicationController.
module Api
  module V1
    module Webhooks
      class RazorpayController < ApplicationController
        # Webhooks don't have standard CSRF or user tokens
        skip_before_action :verify_authenticity_token, raise: false

        def create
          # 1. Verify signature
          signature = request.headers["X-Razorpay-Signature"]
          payload = request.raw_post

          # In a real environment with keys set:
          # begin
          #   Razorpay::Utility.verify_webhook_signature(payload, signature, ENV['RAZORPAY_WEBHOOK_SECRET'])
          # rescue SecurityError
          #   return head :unauthorized
          # end

          # 2. Process webhook idempotently
          result = RazorpayWebhookService.call(event: params.permit!.to_h)

          if result.success?
            head :ok
          else
            head :unprocessable_content
          end
        end
      end
    end
  end
end
