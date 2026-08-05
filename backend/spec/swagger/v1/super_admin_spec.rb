require 'swagger_helper'

RSpec.describe 'SuperAdmin Platform Operations API', type: :request do
  path '/api/v1/super_admin/login' do
    post 'SuperAdmin administrative authentication' do
      tags 'SuperAdmin Platform'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          email: { type: :string, example: 'admin@fleetplatform.in' },
          password: { type: :string, example: 'SuperSecretPass123!' }
        },
        required: [ 'email', 'password' ]
      }

      response '200', 'superadmin authenticated' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/super_admin/dashboard' do
    get 'Platform-wide SaaS metrics, tenant counts, and monthly recurring revenue' do
      tags 'SuperAdmin Platform'
      security [ BearerAuth: [] ]
      produces 'application/json'

      response '200', 'platform metrics retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/super_admin/owners' do
    get 'Lists all tenant fleet owners' do
      tags 'SuperAdmin Platform'
      security [ BearerAuth: [] ]
      produces 'application/json'

      response '200', 'owners collection retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    post 'Provisions a new tenant owner account and schema' do
      tags 'SuperAdmin Platform'
      security [ BearerAuth: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          company_name: { type: :string, example: 'Deccan Earthmovers' },
          subdomain: { type: :string, example: 'deccan-earthmovers' },
          email: { type: :string, example: 'owner@deccan.in' },
          password: { type: :string, example: 'SecurePassword123!' }
        },
        required: [ 'company_name', 'subdomain', 'email', 'password' ]
      }

      response '201', 'owner tenant provisioned' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/super_admin/owners/{id}/status' do
    parameter name: :id, in: :path, type: :integer, description: 'Owner ID'

    patch 'Suspends or activates a tenant owner' do
      tags 'SuperAdmin Platform'
      security [ BearerAuth: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          status: { type: :string, enum: [ 'active', 'suspended' ], example: 'active' }
        },
        required: [ 'status' ]
      }

      response '200', 'owner status updated' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
