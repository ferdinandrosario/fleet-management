# Analytics, dashboard metrics, and CSV export reporting service (Session 10).
class ReportingService
  class << self
    def system_info
      pg_version = ActiveRecord::Base.connection.select_value("SHOW server_version;").to_s.strip
      postgis_version = ActiveRecord::Base.connection.select_value("SELECT PostGIS_Lib_Version();").to_s.strip

      {
        postgresql_version: pg_version,
        postgis_version: postgis_version,
        ruby_version: RUBY_VERSION,
        rails_version: Rails.version,
        os_version: fetch_os_version
      }
    end

    def owner_dashboard
      vehicles_count = Vehicle.count
      active_vehicles_count = Vehicle.where(status: :available).count
      completed_bookings = Booking.where(status: :completed)

      total_revenue_paise = completed_bookings.sum(:total_paise)
      completed_jobs_count = completed_bookings.count
      active_drivers_count = User.where(role: :driver).count
      average_rating = Vehicle.average(:average_rating).to_f.round(2)

      utilization_pct = vehicles_count.positive? ? ((active_vehicles_count.to_f / vehicles_count) * 100).round(1) : 0.0

      {
        total_revenue_paise: total_revenue_paise,
        completed_jobs_count: completed_jobs_count,
        total_vehicles_count: vehicles_count,
        active_vehicles_count: active_vehicles_count,
        active_drivers_count: active_drivers_count,
        average_vehicle_rating: average_rating,
        vehicle_utilization_pct: utilization_pct,
        system_info: system_info
      }
    end

    def super_admin_dashboard
      total_owners = Owner.count
      active_owners = Owner.where(status: :active).count
      active_subscriptions = Subscription.where(status: :active)

      mrr_paise = active_subscriptions.joins(:plan).sum("plans.price_paise")

      {
        total_owners_count: total_owners,
        active_owners_count: active_owners,
        active_subscriptions_count: active_subscriptions.count,
        mrr_paise: mrr_paise,
        system_info: system_info
      }
    end

    def export_bookings_csv(start_date: nil, end_date: nil)
      scope = Booking.includes(:customer, :vehicle, :driver).order(created_at: :desc)
      if start_date.present? && end_date.present?
        st = Date.parse(start_date.to_s).beginning_of_day
        et = Date.parse(end_date.to_s).end_of_day
        scope = scope.where(created_at: st..et)
      end

      rows = [
        [ "Booking ID", "Customer", "Vehicle", "Driver", "Start Time", "End Time", "Status", "Payment Status", "Total Paise" ]
      ]

      scope.find_each do |b|
        rows << [
          b.uuid,
          b.customer.name,
          b.vehicle.name,
          b.driver&.name || "Unassigned",
          b.start_time.iso8601,
          b.end_time.iso8601,
          b.status,
          b.payment_status,
          b.total_paise
        ]
      end

      rows.map { |r| r.map { |f| escape_csv_field(f) }.join(",") }.join("\n") + "\n"
    end

    private

    def escape_csv_field(field)
      val = field.to_s.gsub('"', '""')
      val.match?(/[,\n"]/) ? "\"#{val}\"" : val
    end

    def fetch_os_version
      if File.exist?("/etc/os-release")
        os_release = File.read("/etc/os-release")
        pretty_name = os_release[/^PRETTY_NAME="?([^"\n]+)"?/, 1]
        return pretty_name if pretty_name.present?
      end

      if RUBY_PLATFORM.include?("darwin")
        mac_ver = `sw_vers -productVersion 2>/dev/null`.to_s.strip
        return "macOS #{mac_ver}" if mac_ver.present?
      end

      require "etc"
      u = Etc.uname
      "#{u[:sysname]} #{u[:release]}"
    end
  end
end
