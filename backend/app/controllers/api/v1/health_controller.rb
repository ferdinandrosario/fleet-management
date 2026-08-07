module Api
  module V1
    # Liveness probe returning the standard envelope. Unauthenticated by
    # design — consumed by uptime monitors and the mobile/web boot check.
    # The framework's `/up` (rails/health) stays for load balancers; this
    # one proves the API namespace + envelope are wired.
    class HealthController < ApplicationController
      def show
        render_success(data: {
          service: "fleet-management-api",
          status: "ok",
          system_info: ReportingService.system_info
        })
      end
    end
  end
end
