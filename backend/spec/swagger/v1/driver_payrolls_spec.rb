require 'swagger_helper'

RSpec.describe 'Driver Payroll API', type: :request do
  path '/api/v1/driver_payrolls' do
    get 'Lists all driver payroll records' do
      tags 'Driver Management'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'payroll collection retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/driver_payrolls/calculate' do
    post 'Calculates monthly payroll settlement for drivers' do
      tags 'Driver Management'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          month: { type: :integer, example: 8 },
          year: { type: :integer, example: 2026 }
        },
        required: [ 'month', 'year' ]
      }

      response '200', 'payroll calculation completed' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/driver_payrolls/{id}/pay' do
    parameter name: :id, in: :path, type: :string, description: 'Payroll UUID'

    patch 'Marks a driver payroll as paid/settled' do
      tags 'Driver Management'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'payroll marked as paid' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
