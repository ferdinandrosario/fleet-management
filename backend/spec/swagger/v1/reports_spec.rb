require 'swagger_helper'

RSpec.describe 'Owner Reporting & Analytics API', type: :request do
  path '/api/v1/reports/dashboard' do
    get 'Retrieves owner fleet analytics, revenue trends, and vehicle utilization' do
      tags 'Reports & Analytics'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'dashboard metrics retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/reports/bookings_csv' do
    get 'Exports booking financial logs as CSV' do
      tags 'Reports & Analytics'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'text/csv'

      response '200', 'CSV export generated' do
        run_test!
      end
    end
  end
end
