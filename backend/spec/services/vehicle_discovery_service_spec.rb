require "rails_helper"

RSpec.describe VehicleDiscoveryService do
  let!(:v1) { create(:vehicle, latitude: 9.9252, longitude: 78.1198, category: :jcb) } # Madurai
  let!(:v2) { create(:vehicle, latitude: 13.0827, longitude: 80.2707, category: :jcb) } # Chennai (~420km away)
  let!(:v3) { create(:vehicle, latitude: 9.9300, longitude: 78.1200, category: :tractor) } # Madurai near v1

  describe ".call" do
    it "filters vehicles by spatial radius and sorts by distance" do
      v_unlocated = create(:vehicle, latitude: nil, longitude: nil, category: :jcb)
      res = described_class.call(latitude: 9.9252, longitude: 78.1198, radius_km: 50.0)

      expect(res.vehicles).to include(v1, v3, v_unlocated)
      expect(res.vehicles).not_to include(v2)
      expect(res.distances[v1.uuid]).to be_within(0.5).of(0.0)
    end

    it "filters vehicles by category" do
      res = described_class.call(category: "tractor")

      expect(res.vehicles).to include(v3)
      expect(res.vehicles).not_to include(v1, v2)
    end

    it "excludes vehicles with conflicting availability blocks or active bookings" do
      st = 2.hours.from_now
      et = 6.hours.from_now
      create(:vehicle_availability, vehicle: v1, start_time: st, end_time: et)

      res = described_class.call(start_time: st.iso8601, end_time: et.iso8601)

      expect(res.vehicles).not_to include(v1)
      expect(res.vehicles).to include(v2, v3)
    end
  end
end
