require "rails_helper"

RSpec.describe GpsTrackingService do
  let(:driver) { create(:user, role: :driver) }
  let(:booking) { create(:booking, driver: driver, status: :in_progress) }

  describe ".record_ping" do
    it "records GPS location ping and updates vehicle coordinates" do
      res = described_class.record_ping(
        booking: booking,
        driver: driver,
        latitude: 9.9252,
        longitude: 78.1198,
        speed_kmh: 30.0
      )

      expect(res).to be_success
      expect(res.ping).to be_persisted
      expect(booking.vehicle.reload.latitude).to eq(9.9252)
      expect(booking.vehicle.longitude).to eq(78.1198)
    end

    it "returns error if booking or driver is nil" do
      nil_res = described_class.record_ping(booking: nil, driver: driver, latitude: 9.9252, longitude: 78.1198)
      expect(nil_res).not_to be_success
    end

    it "returns error if booking is not active" do
      booking.completed!
      res = described_class.record_ping(booking: booking, driver: driver, latitude: 9.9252, longitude: 78.1198)

      expect(res).not_to be_success
      expect(res.errors[:booking]).to include("must be confirmed or in_progress to record GPS")
    end

    it "returns error if driver is not assigned" do
      other_driver = create(:user, role: :driver)
      res = described_class.record_ping(booking: booking, driver: other_driver, latitude: 9.9252, longitude: 78.1198)

      expect(res).not_to be_success
      expect(res.errors[:driver]).to include("is not assigned to this booking")
    end

    it "returns errors hash if ping validation fails" do
      res = described_class.record_ping(booking: booking, driver: driver, latitude: 200.0, longitude: 78.1198)

      expect(res).not_to be_success
      expect(res.errors[:latitude]).to be_present
    end
  end

  describe ".get_trail" do
    it "returns chronological trail of GPS pings" do
      p1 = create(:gps_ping, booking: booking, driver: driver, recorded_at: 10.minutes.ago)
      p2 = create(:gps_ping, booking: booking, driver: driver, recorded_at: 5.minutes.ago)

      res = described_class.get_trail(booking: booking)

      expect(res).to be_success
      expect(res.trail).to eq([ p1, p2 ])
    end

    it "returns error if booking is nil" do
      res = described_class.get_trail(booking: nil)

      expect(res).not_to be_success
    end
  end
end
