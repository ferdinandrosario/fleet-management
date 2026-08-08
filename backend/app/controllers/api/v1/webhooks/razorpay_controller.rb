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

          secret = ENV["RAZORPAY_WEBHOOK_SECRET"]
          if secret.present? && signature.present?
            expected_signature = OpenSSL::HMAC.hexdigest("SHA256", secret, payload)
            return head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected_signature, signature.to_s)
          elsif Rails.env.production?
            return head :unauthorized
          end

          # 2. Process webhook idempotently
          event_payload = params.to_unsafe_h.except(:controller, :action, :razorpay)
          result = RazorpayWebhookService.call(event: event_payload)

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
