require 'swagger_helper'

RSpec.describe 'Vehicle & Trip Reviews API', type: :request do
  path '/api/v1/bookings/{id}/review' do
    parameter name: :id, in: :path, type: :string, description: 'Booking UUID'

    post 'Submits a customer rating and review for a completed booking' do
      tags 'Reviews'
      security [BearerAuth: [], TenantHeader: []]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          rating: { type: :integer, minimum: 1, maximum: 5, example: 5 },
          comment: { type: :string, example: 'Equipment was in pristine condition.' }
        },
        required: ['rating']
      }

      response '201', 'review submitted' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/vehicles/{id}/reviews' do
    parameter name: :id, in: :path, type: :string, description: 'Vehicle UUID'

    get 'Lists all reviews for a specific vehicle' do
      tags 'Reviews'
      security [BearerAuth: [], TenantHeader: []]
      produces 'application/json'

      response '200', 'vehicle reviews retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
