require "rails_helper"

RSpec.describe PaymentVerificationService do
  let(:booking) { create(:booking, status: :pending_payment, payment_status: :pending) }

  describe ".call" do
    it "confirms booking upon advance payment verification" do
      res = described_class.call(booking: booking, razorpay_payment_id: "pay_test_12345")

      expect(res).to be_success
      expect(booking.reload.status).to eq("confirmed")
      expect(booking.payment_status).to eq("advance_paid")
      expect(booking.razorpay_payment_id).to eq("pay_test_12345")
    end

    it "returns error for missing payment id" do
      res = described_class.call(booking: booking, razorpay_payment_id: nil)

      expect(res).not_to be_success
      expect(res.errors[:payment]).to include("payment_id is required")
    end

    it "returns error if booking is nil or not pending payment" do
      booking.confirmed!
      res = described_class.call(booking: booking, razorpay_payment_id: "pay_123")

      expect(res).not_to be_success
      expect(res.errors[:booking]).to include("is not pending payment")

      nil_res = described_class.call(booking: nil, razorpay_payment_id: "pay_123")
      expect(nil_res).not_to be_success
    end
  end
end
