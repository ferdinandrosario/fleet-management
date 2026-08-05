require 'swagger_helper'

RSpec.describe 'GPS Telemetry & Live Tracking API', type: :request do
  path '/api/v1/bookings/{id}/gps_pings' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    post 'Ingests a GPS ping for active trip telemetry' do
      tags 'GPS Telemetry'
      security [BearerAuth: [], TenantHeader: []]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          latitude: { type: :number, example: 12.9716 },
          longitude: { type: :number, example: 77.5946 },
          speed_kmh: { type: :number, example: 45.2 },
          heading: { type: :number, example: 180.0 }
        },
        required: ['latitude', 'longitude']
      }

      response '201', 'GPS ping recorded' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/bookings/{id}/tracking' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    get 'Retrieves live tracking route history and current coordinates' do
      tags 'GPS Telemetry'
      security [BearerAuth: [], TenantHeader: []]
      produces 'application/json'

      response '200', 'tracking coordinates retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
