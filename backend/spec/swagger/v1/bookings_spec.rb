require 'swagger_helper'

RSpec.describe 'Bookings API', type: :request do
  path '/api/v1/bookings' do
    get 'Lists all bookings' do
      tags 'Bookings'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'bookings list retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    post 'Creates a new vehicle booking reservation' do
      tags 'Bookings'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          vehicle_uuid: { type: :string, format: :uuid },
          start_time: { type: :string, format: :'date-time' },
          end_time: { type: :string, format: :'date-time' },
          delivery_location: { type: :string, example: 'Bandra West, Mumbai' }
        },
        required: [ 'vehicle_uuid', 'start_time', 'end_time' ]
      }

      response '201', 'booking created' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/bookings/{id}' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    get 'Retrieves booking details' do
      tags 'Bookings'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'booking details retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/bookings/{id}/pay_advance' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    post 'Processes Razorpay advance payment for booking' do
      tags 'Bookings'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          razorpay_payment_id: { type: :string, example: 'pay_LgX1234567' },
          razorpay_signature: { type: :string, example: 'sig_abc123' }
        },
        required: [ 'razorpay_payment_id' ]
      }

      response '200', 'advance payment recorded' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/bookings/{id}/cancel' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    patch 'Cancels an existing booking reservation' do
      tags 'Bookings'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          cancellation_reason: { type: :string, example: 'Schedule changed' }
        }
      }

      response '200', 'booking cancelled' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
