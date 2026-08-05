require 'swagger_helper'

RSpec.describe 'Vehicle Availability Windows API', type: :request do
  path '/api/v1/vehicles/{vehicle_id}/availabilities' do
    parameter name: :vehicle_id, in: :path, type: :string, description: 'Vehicle UUID'

    get 'Lists availability schedules for a vehicle' do
      tags 'Vehicle Availability'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'availability windows listed' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    post 'Creates a blackout or available time slot window for a vehicle' do
      tags 'Vehicle Availability'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          start_time: { type: :string, format: :'date-time' },
          end_time: { type: :string, format: :'date-time' },
          status: { type: :string, enum: [ 'available', 'maintenance', 'blocked' ], example: 'available' }
        },
        required: [ 'start_time', 'end_time' ]
      }

      response '201', 'availability window created' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/vehicles/{vehicle_id}/availabilities/{id}' do
    parameter name: :vehicle_id, in: :path, type: :string, description: 'Vehicle UUID'
    parameter name: :id, in: :path, type: :string, description: 'Availability UUID'

    delete 'Removes an availability window' do
      tags 'Vehicle Availability'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'availability window deleted' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
