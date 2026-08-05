require 'swagger_helper'

RSpec.describe 'Dynamic Pricing Rules API', type: :request do
  path '/api/v1/vehicles/{vehicle_id}/pricing_rules' do
    parameter name: :vehicle_id, in: :path, type: :string, description: 'Vehicle UUID'

    get 'Lists dynamic rate surge/discount pricing rules' do
      tags 'Pricing Rules'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'pricing rules listed' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    post 'Adds a dynamic surge or seasonal rate multiplier rule' do
      tags 'Pricing Rules'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'Monsoon Seasonal Surge' },
          multiplier: { type: :number, example: 1.25 },
          start_date: { type: :string, format: :date },
          end_date: { type: :string, format: :date }
        },
        required: [ 'name', 'multiplier' ]
      }

      response '201', 'pricing rule created' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/vehicles/{vehicle_id}/pricing_rules/{id}' do
    parameter name: :vehicle_id, in: :path, type: :string, description: 'Vehicle UUID'
    parameter name: :id, in: :path, type: :string, description: 'Pricing Rule UUID'

    delete 'Removes a pricing rule' do
      tags 'Pricing Rules'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'pricing rule deleted' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
