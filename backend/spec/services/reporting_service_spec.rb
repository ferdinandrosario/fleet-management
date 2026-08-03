require "rails_helper"

RSpec.describe ReportingService do
  describe ".owner_dashboard" do
    it "calculates owner fleet metrics correctly" do
      Vehicle.delete_all
      Booking.delete_all

      vehicle = create(:vehicle, status: :available)
      create(:booking, vehicle: vehicle, status: :completed, total_cents: 25000)

      metrics = described_class.owner_dashboard

      expect(metrics[:total_vehicles_count]).to eq(1)
      expect(metrics[:active_vehicles_count]).to eq(1)
      expect(metrics[:completed_jobs_count]).to eq(1)
      expect(metrics[:total_revenue_cents]).to eq(25000)
    end
  end

  describe ".super_admin_dashboard" do
    it "calculates platform super admin metrics correctly" do
      Owner.delete_all
      Subscription.delete_all

      plan = create(:plan, price_paise: 10000)
      owner = create(:owner, status: :active)
      create(:subscription, owner: owner, plan: plan, status: :active)

      metrics = described_class.super_admin_dashboard

      expect(metrics[:total_owners_count]).to eq(1)
      expect(metrics[:active_owners_count]).to eq(1)
      expect(metrics[:active_subscriptions_count]).to eq(1)
      expect(metrics[:mrr_paise]).to eq(10000)
    end
  end

  describe ".export_bookings_csv" do
    it "generates valid CSV string of booking records" do
      create(:booking, status: :completed, total_cents: 15000)

      csv_output = described_class.export_bookings_csv(
        start_date: 1.day.ago.to_date,
        end_date: Date.current
      )

      expect(csv_output).to include("Booking ID,Customer,Vehicle,Driver,Start Time,End Time,Status,Payment Status,Total Cents")
      expect(csv_output).to include("completed")
    end
  end
end
