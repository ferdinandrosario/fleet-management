require 'swagger_helper'

RSpec.describe 'Authentication & User Profile API', type: :request, rswag_dry_run: true do
  path '/api/v1/auth/register' do
    post 'Registers a new user or owner' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      parameter name: 'X-Tenant', in: :header, type: :string, required: true, description: 'Tenant subdomain'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'Rajesh Kumar' },
          phone: { type: :string, example: '+919876543210' },
          role: { type: :string, example: 'customer' }
        },
        required: [ 'name', 'phone' ]
      }

      response '200', 'user registered successfully' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end

      response '422', 'validation error' do
        schema '$ref' => '#/components/schemas/StandardErrorEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/auth/otp' do
    post 'Sends OTP to a mobile phone' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          phone: { type: :string, example: '+919876543210' }
        },
        required: [ 'phone' ]
      }

      response '200', 'OTP sent successfully' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/auth/otp/verify' do
    post 'Verifies an OTP code and returns access token' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          phone: { type: :string, example: '+919876543210' },
          otp_code: { type: :string, example: '123456' }
        },
        required: [ 'phone', 'otp_code' ]
      }

      response '200', 'OTP verified successfully' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end

  path '/api/v1/me' do
    get 'Retrieves current user profile' do
      tags 'User Profile'
      security [ BearerAuth: [], TenantHeader: [] ]
      produces 'application/json'

      response '200', 'profile details retrieved' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end

    patch 'Updates current user profile' do
      tags 'User Profile'
      security [ BearerAuth: [], TenantHeader: [] ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'Rajesh Kumar Updated' }
        }
      }

      response '200', 'profile updated' do
        schema '$ref' => '#/components/schemas/StandardSuccessEnvelope'
        run_test!
      end
    end
  end
end
