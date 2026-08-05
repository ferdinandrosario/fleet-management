require 'swagger_helper'

RSpec.describe 'Geospatial Discovery & Vehicle Search API', type: :request do
  path '/api/v1/discovery/vehicles' do
    get 'Searches nearby available vehicles by location coordinates and filters' do
      tags 'Discovery'
      produces 'application/json'
      parameter name: :latitude, in: :query, type: :number, required: true, example: 12.9716
      parameter name: :longitude, in: :query, type: :number, required: true, example: 77.5946
      parameter name: :radius_km, in: :query, type: :number, required: false, example: 25.0
      parameter name: :vehicle_type, in: :query, type: :string, required: false, example: 'tractor'

      response '200', 'nearby vehicles discovered' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
