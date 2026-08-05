require 'swagger_helper'

RSpec.describe 'Driver Leave Management API', type: :request do
  path '/api/v1/driver_leaves' do
    get 'Lists all driver leave requests' do
      tags 'Driver Management'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'driver leaves listed' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    post 'Submits a new driver leave request' do
      tags 'Driver Management'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          start_date: { type: :string, format: :date, example: '2026-08-10' },
          end_date: { type: :string, format: :date, example: '2026-08-12' },
          reason: { type: :string, example: 'Personal Leave' }
        },
        required: [ 'start_date', 'end_date' ]
      }

      response '201', 'leave request created' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/driver_leaves/{id}/status' do
    parameter name: :id, in: :path, type: :string, description: 'Leave UUID'

    patch 'Approves or rejects a driver leave request' do
      tags 'Driver Management'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          status: { type: :string, enum: [ 'approved', 'rejected' ], example: 'approved' }
        },
        required: [ 'status' ]
      }

      response '200', 'leave status updated' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
