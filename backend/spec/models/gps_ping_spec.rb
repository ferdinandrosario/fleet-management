require "rails_helper"

RSpec.describe GpsPing, type: :model do
  describe "validations" do
    it "is valid with valid latitude, longitude, and recorded_at" do
      ping = build(:gps_ping)
      expect(ping).to be_valid
    end

    it "validates latitude and longitude numericality bounds" do
      ping = build(:gps_ping, latitude: 100.0, longitude: -200.0)
      expect(ping).not_to be_valid
      expect(ping.errors[:latitude]).to include("must be less than or equal to 90")
      expect(ping.errors[:longitude]).to include("must be greater than or equal to -180")
    end

    it "requires recorded_at" do
      ping = build(:gps_ping, recorded_at: nil)
      expect(ping).not_to be_valid
      expect(ping.errors[:recorded_at]).to include("can't be blank")
    end
  end

  describe "scopes" do
    it "orders pings chronologically and latest first" do
      booking = create(:booking)
      driver = create(:user, role: :driver)
      p1 = create(:gps_ping, booking: booking, driver: driver, recorded_at: 10.minutes.ago)
      p2 = create(:gps_ping, booking: booking, driver: driver, recorded_at: 5.minutes.ago)

      expect(GpsPing.chronological).to eq([ p1, p2 ])
      expect(GpsPing.latest_first).to eq([ p2, p1 ])
    end
  end
end
