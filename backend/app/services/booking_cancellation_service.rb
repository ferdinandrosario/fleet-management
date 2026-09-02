# Cancels a booking and issues a Razorpay API refund if an advance payment was captured.
class BookingCancellationService
  Result = Struct.new(:success, :booking, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def call(booking:)
      if booking.completed? || booking.cancelled?
        return Result.new(success: false, errors: { booking: [ "cannot be cancelled" ] })
      end

      booking.with_lock do
        # Do not double-refund if it was somehow already refunded or pending refund
        if booking.advance_paid? && booking.razorpay_payment_id.present?
          begin
            refund_payment(booking.razorpay_payment_id, booking.advance_paise)
          rescue Razorpay::Error => e
            Rails.logger.error("[BookingCancellationService] Refund failed for booking #{booking.id}: #{e.message}")
            return Result.new(success: false, errors: { refund: [ "Failed to process Razorpay refund: #{e.message}" ] })
          rescue StandardError => e
            Rails.logger.error("[BookingCancellationService] Unexpected refund error for booking #{booking.id}: #{e.message}")
            return Result.new(success: false, errors: { refund: [ "Failed to process refund due to internal error" ] })
          end
          
          booking.update!(payment_status: :refunded)
        elsif booking.advance_paid? && booking.razorpay_payment_id.blank?
          Rails.logger.warn("[BookingCancellationService] Booking #{booking.id} is advance_paid but missing payment ID. Marking as refunded without API call.")
          booking.update!(payment_status: :refunded)
        end

        booking.cancelled!
      end

      Result.new(success: true, booking: booking)
    end

    private

    def refund_payment(payment_id, amount_paise)
      setup_razorpay
      Razorpay::Refund.create(payment_id: payment_id, amount: amount_paise)
    end

    def setup_razorpay
      key_id = ENV.fetch("RAZORPAY_KEY_ID") { Rails.application.credentials.dig(:razorpay, :key_id).to_s }
      key_secret = ENV.fetch("RAZORPAY_KEY_SECRET") { Rails.application.credentials.dig(:razorpay, :key_secret).to_s }
      Razorpay.setup(key_id, key_secret)
    end
  end
end
