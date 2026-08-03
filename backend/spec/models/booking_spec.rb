require "rails_helper"

RSpec.describe Booking, type: :model do
  describe "validations" do
    it "is valid with standard attributes" do
      booking = build(:booking)
      expect(booking).to be_valid
    end

    it "requires start_time and end_time" do
      booking = build(:booking, start_time: nil, end_time: nil)
      expect(booking).not_to be_valid
      expect(booking.errors[:start_time]).to include("can't be blank")
      expect(booking.errors[:end_time]).to include("can't be blank")
    end

    it "validates end_time is after start_time" do
      booking = build(:booking, start_time: 4.hours.from_now, end_time: 2.hours.from_now)
      expect(booking).not_to be_valid
      expect(booking.errors[:end_time]).to include("must be after start time")
    end

    it "validates total_cents and advance_cents numericality" do
      booking = build(:booking, total_cents: -1, advance_cents: -5)
      expect(booking).not_to be_valid
      expect(booking.errors[:total_cents]).to include("must be greater than or equal to 0")
      expect(booking.errors[:advance_cents]).to include("must be greater than or equal to 0")
    end
  end

  describe "scopes" do
    let(:vehicle) { create(:vehicle) }
    let(:customer) { create(:user) }

    it "filters active bookings and overlapping ranges" do
      b1 = create(:booking, vehicle: vehicle, customer: customer, status: :confirmed, start_time: 2.hours.from_now, end_time: 6.hours.from_now)
      _b2 = create(:booking, vehicle: vehicle, customer: customer, status: :cancelled, start_time: 2.hours.from_now, end_time: 6.hours.from_now)

      expect(Booking.active).to include(b1)
      expect(Booking.active.count).to eq(1)

      overlapping = Booking.overlapping_range(3.hours.from_now, 5.hours.from_now)
      expect(overlapping).to include(b1)
    end
  end
end
