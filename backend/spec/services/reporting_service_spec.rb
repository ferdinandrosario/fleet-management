require "rails_helper"

RSpec.describe ReportingService do
  describe ".system_info" do
    it "returns system environment metrics" do
      info = described_class.system_info

      expect(info[:postgresql_version]).to be_present
      expect(info[:postgis_version]).to be_present
      expect(info[:ruby_version]).to eq(RUBY_VERSION)
      expect(info[:rails_version]).to eq(Rails.version)
      expect(info[:os_version]).to be_present
    end

    context "when running on Linux with /etc/os-release" do
      it "parses PRETTY_NAME from /etc/os-release" do
        allow(File).to receive(:exist?).with("/etc/os-release").and_return(true)
        allow(File).to receive(:read).with("/etc/os-release").and_return("PRETTY_NAME=\"Ubuntu 24.04 LTS\"\nNAME=\"Ubuntu\"")

        info = described_class.system_info
        expect(info[:os_version]).to eq("Ubuntu 24.04 LTS")
      end
    end

    context "when running on macOS (darwin)" do
      it "returns macOS product version" do
        allow(File).to receive(:exist?).with("/etc/os-release").and_return(false)
        stub_const("RUBY_PLATFORM", "x86_64-darwin22")
        allow(described_class).to receive(:`).with("sw_vers -productVersion 2>/dev/null").and_return("14.5\n")

        info = described_class.system_info
        expect(info[:os_version]).to eq("macOS 14.5")
      end
    end

    context "when running on generic Unix" do
      it "falls back to Etc.uname" do
        allow(File).to receive(:exist?).with("/etc/os-release").and_return(false)
        stub_const("RUBY_PLATFORM", "x86_64-linux")
        allow(Etc).to receive(:uname).and_return({ sysname: "FreeBSD", release: "13.0-RELEASE" })

        info = described_class.system_info
        expect(info[:os_version]).to eq("FreeBSD 13.0-RELEASE")
      end
    end
  end

  describe ".owner_dashboard" do
    it "calculates owner fleet metrics correctly" do
      Vehicle.delete_all
      Booking.delete_all

      vehicle = create(:vehicle, status: :available)
      create(:booking, vehicle: vehicle, status: :completed, total_paise: 25000)

      metrics = described_class.owner_dashboard

      expect(metrics[:total_vehicles_count]).to eq(1)
      expect(metrics[:active_vehicles_count]).to eq(1)
      expect(metrics[:completed_jobs_count]).to eq(1)
      expect(metrics[:total_revenue_paise]).to eq(25000)
      expect(metrics[:vehicle_utilization_pct]).to eq(100.0)
    end

    it "handles zero vehicles without division by zero" do
      Vehicle.delete_all
      Booking.delete_all

      metrics = described_class.owner_dashboard

      expect(metrics[:total_vehicles_count]).to eq(0)
      expect(metrics[:vehicle_utilization_pct]).to eq(0.0)
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
    it "generates valid CSV string with date filtering and assigned driver" do
      driver = create(:user, :driver, name: "Ramesh Kumar")
      booking = create(:booking, driver: driver, status: :completed, total_paise: 15000)

      csv_output = described_class.export_bookings_csv(
        start_date: 1.day.ago.to_date,
        end_date: Date.current
      )

      expect(csv_output).to include("Booking ID,Customer,Vehicle,Driver,Start Time,End Time,Status,Payment Status,Total Paise")
      expect(csv_output).to include("Ramesh Kumar")
      expect(csv_output).to include("completed")
    end

    it "handles unassigned driver and missing date parameters" do
      booking = create(:booking, driver: nil, status: :pending_payment, total_paise: 10000)

      csv_output = described_class.export_bookings_csv

      expect(csv_output).to include("Unassigned")
      expect(csv_output).to include("pending_payment")
    end

    it "escapes CSV fields containing quotes or commas" do
      customer = create(:user, :customer, name: 'John "The Boss" Doe, Esq.')
      booking = create(:booking, customer: customer)

      csv_output = described_class.export_bookings_csv
      expect(csv_output).to include('"John ""The Boss"" Doe, Esq."')
    end
  end
end
