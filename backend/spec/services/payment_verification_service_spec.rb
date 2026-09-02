require "rails_helper"

RSpec.describe PaymentVerificationService do
  let(:booking) { create(:booking, status: :pending_payment, payment_status: :pending) }
  let(:payment_id) { "pay_test_12345" }
  let(:razorpay_key_secret) { "test_razorpay_key_secret_value" }

  def valid_signature_for(order_id, pay_id, secret: razorpay_key_secret)
    OpenSSL::HMAC.hexdigest("SHA256", secret, "#{order_id}|#{pay_id}")
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("RAZORPAY_KEY_SECRET").and_return(razorpay_key_secret)
  end

  describe ".call" do
    it "confirms booking when signature is valid" do
      sig = valid_signature_for(booking.razorpay_order_id, payment_id)

      res = described_class.call(
        booking: booking,
        razorpay_payment_id: payment_id,
        razorpay_signature: sig
      )

      expect(res).to be_success
      expect(booking.reload.status).to eq("confirmed")
      expect(booking.payment_status).to eq("advance_paid")
      expect(booking.razorpay_payment_id).to eq(payment_id)
    end

    it "rejects an invalid signature" do
      res = described_class.call(
        booking: booking,
        razorpay_payment_id: payment_id,
        razorpay_signature: "bad_signature"
      )

      expect(res).not_to be_success
      expect(res.errors[:payment]).to include("signature verification failed")
      expect(booking.reload.status).to eq("pending_payment")
    end

    it "rejects a blank signature" do
      res = described_class.call(
        booking: booking,
        razorpay_payment_id: payment_id,
        razorpay_signature: nil
      )

      expect(res).not_to be_success
      expect(res.errors[:payment]).to include("signature verification failed")
    end

    context "when RAZORPAY_KEY_SECRET is not set" do
      before do
        allow(ENV).to receive(:fetch).with("RAZORPAY_KEY_SECRET").and_raise(KeyError)
        allow(Rails.application.credentials).to receive(:dig).with(:razorpay, :key_secret).and_return(nil)
      end

      it "rejects the payment (fail-closed)" do
        sig = valid_signature_for(booking.razorpay_order_id, payment_id)

        res = described_class.call(
          booking: booking,
          razorpay_payment_id: payment_id,
          razorpay_signature: sig
        )

        expect(res).not_to be_success
        expect(res.errors[:payment]).to include("signature verification failed")
      end
    end

    it "returns error for missing payment id" do
      res = described_class.call(booking: booking, razorpay_payment_id: nil)

      expect(res).not_to be_success
      expect(res.errors[:payment]).to include("payment_id is required")
    end

    it "returns error if booking is nil" do
      sig = valid_signature_for("order_test_1", payment_id)
      res = described_class.call(booking: nil, razorpay_payment_id: payment_id, razorpay_signature: sig)

      expect(res).not_to be_success
      expect(res.errors[:booking]).to include("not found")
    end

    it "returns error if booking is not pending payment" do
      booking.confirmed!
      sig = valid_signature_for(booking.razorpay_order_id, payment_id)

      res = described_class.call(
        booking: booking,
        razorpay_payment_id: payment_id,
        razorpay_signature: sig
      )

      expect(res).not_to be_success
      expect(res.errors[:booking]).to include("is not pending payment")
    end
  end
end
