require 'swagger_helper'

RSpec.describe 'Vehicles Management API', type: :request do
  path '/api/v1/vehicles' do
    get 'Lists all vehicles in the tenant fleet' do
      tags 'Vehicles'
      security [BearerAuth: [], TenantHeader: []]
      produces 'application/json'

      response '200', 'vehicles collection retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    post 'Creates a new vehicle in the fleet' do
      tags 'Vehicles'
      security [BearerAuth: [], TenantHeader: []]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          registration_number: { type: :string, example: 'KA01AB1234' },
          vehicle_type: { type: :string, example: 'tractor' },
          make: { type: :string, example: 'Mahindra' },
          model: { type: :string, example: '575 DI' },
          year: { type: :integer, example: 2024 },
          base_rate_per_hour: { type: :number, example: 850.0 },
          base_rate_per_day: { type: :number, example: 6500.0 }
        },
        required: ['registration_number', 'vehicle_type', 'make', 'model', 'base_rate_per_hour', 'base_rate_per_day']
      }

      response '201', 'vehicle created' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/vehicles/{id}' do
    parameter name: :id, in: :path, type: :string, description: 'Vehicle UUID'

    get 'Retrieves details of a specific vehicle' do
      tags 'Vehicles'
      security [BearerAuth: [], TenantHeader: []]
      produces 'application/json'

      response '200', 'vehicle details retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    patch 'Updates a vehicle' do
      tags 'Vehicles'
      security [BearerAuth: [], TenantHeader: []]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          base_rate_per_hour: { type: :number, example: 900.0 }
        }
      }

      response '200', 'vehicle updated' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    delete 'Deletes a vehicle' do
      tags 'Vehicles'
      security [BearerAuth: [], TenantHeader: []]
      produces 'application/json'

      response '200', 'vehicle deleted' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/vehicles/{id}/quote' do
    parameter name: :id, in: :path, type: :string, description: 'Vehicle UUID'
    parameter name: :start_time, in: :query, type: :string, required: true, description: 'ISO8601 start time'
    parameter name: :end_time, in: :query, type: :string, required: true, description: 'ISO8601 end time'

    get 'Generates a price quote for booking a vehicle' do
      tags 'Vehicles'
      security [BearerAuth: [], TenantHeader: []]
      produces 'application/json'

      response '200', 'price quote generated' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
