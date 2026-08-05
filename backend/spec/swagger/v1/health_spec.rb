require 'swagger_helper'

RSpec.describe 'System Health Check API', type: :request do
  path '/api/v1/health' do
    get 'Performs system health check and database connectivity verification' do
      tags 'System Health'
      produces 'application/json'

      response '200', 'system healthy' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
