require "rails_helper"

RSpec.describe BookingService do
  let(:customer) { create(:user) }
  let(:vehicle) { create(:vehicle, status: :available, hourly_rate_cents: 50000, daily_rate_cents: 350000) }
  let(:st) { 2.hours.from_now }
  let(:et) { 6.hours.from_now }

  describe ".call" do
    it "creates a booking in pending_payment state and returns razorpay order payload" do
      res = described_class.call(
        customer: customer,
        vehicle: vehicle,
        start_time: st.iso8601,
        end_time: et.iso8601,
        pickup_address: "Madurai Junction"
      )

      expect(res).to be_success
      expect(res.booking).to be_persisted
      expect(res.booking.status).to eq("pending_payment")
      expect(res.booking.total_cents).to eq(200000)
      expect(res.razorpay_order[:order_id]).to be_present
    end

    it "caps advance_cents at total_cents when total is lower than minimum advance" do
      cheap_vehicle = create(:vehicle, hourly_rate_cents: 5000)
      res = described_class.call(
        customer: customer,
        vehicle: cheap_vehicle,
        start_time: (1.hour.from_now).iso8601,
        end_time: (2.hours.from_now).iso8601
      )

      expect(res).to be_success
      expect(res.booking.total_cents).to eq(5000)
      expect(res.booking.advance_cents).to eq(5000)
    end

    it "returns error for invalid time range" do
      res = described_class.call(
        customer: customer,
        vehicle: vehicle,
        start_time: et.iso8601,
        end_time: st.iso8601
      )

      expect(res).not_to be_success
      expect(res.errors[:end_time]).to include("must be after start time")
    end

    it "returns error when vehicle is unavailable or booked" do
      create(:booking, vehicle: vehicle, status: :confirmed, start_time: st, end_time: et)

      res = described_class.call(
        customer: customer,
        vehicle: vehicle,
        start_time: st.iso8601,
        end_time: et.iso8601
      )

      expect(res).not_to be_success
      expect(res.errors[:vehicle]).to include("is already booked or unavailable for selected time range")
    end

    it "returns error when vehicle status is not available" do
      vehicle.update!(status: :maintenance)

      res = described_class.call(
        customer: customer,
        vehicle: vehicle,
        start_time: st.iso8601,
        end_time: et.iso8601
      )

      expect(res).not_to be_success
      expect(res.errors[:vehicle]).to include("is not available for booking")
    end

    it "returns errors hash if booking fails model validations on save" do
      res = described_class.call(
        customer: nil,
        vehicle: vehicle,
        start_time: st.iso8601,
        end_time: et.iso8601
      )

      expect(res).not_to be_success
      expect(res.errors[:customer]).to be_present
    end
  end
end
