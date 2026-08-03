# Super Admin platform metric dashboard endpoint (Session 10).
module Api
  module V1
    module SuperAdmin
      class DashboardsController < BaseController
        def show
          authorize :super_admin_dashboard, :show?

          metrics = ReportingService.super_admin_dashboard
          render_success(data: { dashboard: metrics })
        end
      end
    end
  end
end
