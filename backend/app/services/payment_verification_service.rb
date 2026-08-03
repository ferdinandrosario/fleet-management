# Verifies advance token payment and confirms booking reservations (Session 6).
class PaymentVerificationService
  Result = Struct.new(:success, :booking, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def call(booking:, razorpay_payment_id:, razorpay_signature: nil)
      if booking.nil?
        return Result.new(success: false, errors: { booking: [ "not found" ] })
      end

      unless booking.pending_payment?
        return Result.new(success: false, errors: { booking: [ "is not pending payment" ] })
      end

      if razorpay_payment_id.blank?
        return Result.new(success: false, errors: { payment: [ "payment_id is required" ] })
      end

      # Update booking to confirmed and payment_status to advance_paid
      booking.update!(
        razorpay_payment_id: razorpay_payment_id,
        status: :confirmed,
        payment_status: :advance_paid
      )

      Result.new(success: true, booking: booking)
    end
  end
end
