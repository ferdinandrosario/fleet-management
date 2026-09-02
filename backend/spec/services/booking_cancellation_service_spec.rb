require "rails_helper"
require "webmock/rspec"

RSpec.describe BookingCancellationService do
  let(:customer) { create(:user, role: :customer) }
  let(:vehicle) { create(:vehicle) }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("RAZORPAY_KEY_ID").and_return("rzp_test_123")
    allow(ENV).to receive(:fetch).with("RAZORPAY_KEY_SECRET").and_return("rzp_test_secret")
  end

  describe ".call" do
    context "when booking is not advance_paid" do
      let(:booking) { create(:booking, vehicle: vehicle, customer: customer, status: :pending_payment, payment_status: :pending) }

      it "cancels the booking without calling Razorpay" do
        result = described_class.call(booking: booking)
        
        expect(result).to be_success
        expect(booking.reload).to be_cancelled
        expect(booking.payment_status).to eq("pending")
      end
    end

    context "when booking is completed" do
      let(:booking) { create(:booking, vehicle: vehicle, customer: customer, status: :completed) }

      it "returns an error" do
        result = described_class.call(booking: booking)
        
        expect(result).not_to be_success
        expect(result.errors[:booking]).to include("cannot be cancelled")
        expect(booking.reload).to be_completed
      end
    end

    context "when booking is advance_paid with razorpay_payment_id" do
      let(:booking) do
        create(:booking, vehicle: vehicle, customer: customer, status: :confirmed, payment_status: :advance_paid, razorpay_payment_id: "pay_123", advance_paise: 50000)
      end

      it "calls Razorpay refund API and marks as refunded" do
        stub_request(:post, "https://api.razorpay.com/v1/refunds")
          .with(body: { "amount" => "50000", "payment_id" => "pay_123" })
          .to_return(status: 200, body: { id: "rfnd_123", entity: "refund" }.to_json, headers: { "Content-Type" => "application/json" })

        result = described_class.call(booking: booking)

        expect(result).to be_success
        expect(booking.reload).to be_cancelled
        expect(booking.payment_status).to eq("refunded")
      end

      it "returns an error if Razorpay API fails" do
        stub_request(:post, "https://api.razorpay.com/v1/refunds")
          .with(body: { "amount" => "50000", "payment_id" => "pay_123" })
          .to_return(status: 400, body: { error: { description: "Refund already processed" } }.to_json, headers: { "Content-Type" => "application/json" })

        result = described_class.call(booking: booking)

        expect(result).not_to be_success
        expect(result.errors[:refund].first).to match(/Failed to process Razorpay refund:/)
        expect(booking.reload).to be_confirmed
        expect(booking.payment_status).to eq("advance_paid")
      end
    end

    context "when booking is advance_paid without razorpay_payment_id" do
      let(:booking) do
        create(:booking, vehicle: vehicle, customer: customer, status: :confirmed, payment_status: :advance_paid, razorpay_payment_id: nil)
      end

      it "marks as refunded without calling API" do
        result = described_class.call(booking: booking)
        
        expect(result).to be_success
        expect(booking.reload).to be_cancelled
        expect(booking.payment_status).to eq("refunded")
      end
    end
  end
end
