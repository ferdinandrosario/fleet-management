# Verifies advance token payment and confirms booking reservations (Session 6).
# Uses Razorpay's server-side signature verification (HMAC-SHA256 of
# "order_id|payment_id" against the API key secret) to ensure the payment was
# genuinely captured before confirming the booking. Fail-closed: a missing or
# invalid signature always rejects the request.
class PaymentVerificationService
  Result = Struct.new(:success, :booking, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def call(booking:, razorpay_payment_id:, razorpay_signature: nil)
      if booking.nil?
        return Result.new(success: false, errors: { booking: ["not found"] })
      end

      unless booking.pending_payment?
        return Result.new(success: false, errors: { booking: ["is not pending payment"] })
      end

      if razorpay_payment_id.blank?
        return Result.new(success: false, errors: { payment: ["payment_id is required"] })
      end

      unless verify_razorpay_signature(
        order_id: booking.razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature
      )
        return Result.new(success: false, errors: { payment: ["signature verification failed"] })
      end

      booking.update!(
        razorpay_payment_id: razorpay_payment_id,
        status: :confirmed,
        payment_status: :advance_paid
      )

      Result.new(success: true, booking: booking)
    end

    private

    def verify_razorpay_signature(order_id:, payment_id:, signature:)
      return false if signature.blank? || order_id.blank?

      secret = ENV.fetch("RAZORPAY_KEY_SECRET") { Rails.application.credentials.dig(:razorpay, :key_secret).to_s }
      return false if secret.blank?

      expected_payload = "#{order_id}|#{payment_id}"
      expected_signature = OpenSSL::HMAC.hexdigest("SHA256", secret, expected_payload)
      ActiveSupport::SecurityUtils.secure_compare(expected_signature, signature.to_s)
    end
  end
end
