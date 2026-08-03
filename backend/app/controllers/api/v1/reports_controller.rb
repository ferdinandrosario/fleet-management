# Owner analytics dashboard and CSV export endpoints (Session 10).
module Api
  module V1
    class ReportsController < AuthenticatedController
      def dashboard
        authorize :report, :dashboard?

        metrics = ReportingService.owner_dashboard
        render_success(data: { dashboard: metrics })
      end

      def bookings_csv
        authorize :report, :bookings_csv?

        csv_data = ReportingService.export_bookings_csv(
          start_date: params[:start_date],
          end_date: params[:end_date]
        )

        send_data csv_data, filename: "bookings-export-#{Date.current}.csv", type: "text/csv; charset=utf-8"
      end
    end
  end
end
