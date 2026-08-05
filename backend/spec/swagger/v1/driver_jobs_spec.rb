require 'swagger_helper'

RSpec.describe 'Driver Job Execution API', type: :request do
  path '/api/v1/bookings/{id}/assign_driver' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    post 'Assigns a driver to a booking' do
      tags 'Driver Operations'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          driver_id: { type: :integer, example: 5 }
        },
        required: [ 'driver_id' ]
      }

      response '200', 'driver assigned' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/bookings/{id}/start_job' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    post 'Starts a job/trip for an assigned booking' do
      tags 'Driver Operations'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'

      response '200', 'job started' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/bookings/{id}/finish_job' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    post 'Completes a job and uploads proof photo' do
      tags 'Driver Operations'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          odometer_reading: { type: :number, example: 14250.5 },
          completion_notes: { type: :string, example: 'Tractor returned in good condition.' }
        }
      }

      response '200', 'job completed' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
