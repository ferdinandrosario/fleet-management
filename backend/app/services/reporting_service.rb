# Analytics, dashboard metrics, and CSV export reporting service (Session 10).
class ReportingService
  class << self
    def owner_dashboard
      vehicles_count = Vehicle.count
      active_vehicles_count = Vehicle.where(status: :available).count
      completed_bookings = Booking.where(status: :completed)

      total_revenue_cents = completed_bookings.sum(:total_cents)
      completed_jobs_count = completed_bookings.count
      active_drivers_count = User.where(role: :driver).count
      average_rating = Vehicle.average(:average_rating).to_f.round(2)

      utilization_pct = vehicles_count.positive? ? ((active_vehicles_count.to_f / vehicles_count) * 100).round(1) : 0.0

      {
        total_revenue_cents: total_revenue_cents,
        completed_jobs_count: completed_jobs_count,
        total_vehicles_count: vehicles_count,
        active_vehicles_count: active_vehicles_count,
        active_drivers_count: active_drivers_count,
        average_vehicle_rating: average_rating,
        vehicle_utilization_pct: utilization_pct
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
        mrr_paise: mrr_paise
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
        [ "Booking ID", "Customer", "Vehicle", "Driver", "Start Time", "End Time", "Status", "Payment Status", "Total Cents" ]
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
          b.total_cents
        ]
      end

      rows.map { |r| r.map { |f| escape_csv_field(f) }.join(",") }.join("\n") + "\n"
    end

    private

    def escape_csv_field(field)
      val = field.to_s.gsub('"', '""')
      val.match?(/[,\n"]/) ? "\"#{val}\"" : val
    end
  end
end
