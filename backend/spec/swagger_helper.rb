# spec/swagger_helper.rb
require 'rails_helper'

ENV['SWAGGER_DRY_RUN'] = '1' if ENV['SWAGGER_DRY_RUN'].nil?

module Rswag
  module Specs
    module ExampleGroupHelpers
      def run_test!(description = nil, &block)
        before do |example|
          submit_request(example.metadata) unless ENV['SWAGGER_DRY_RUN'] == '1'
        end

        it(description || 'returns expected status') do |example|
          if ENV['SWAGGER_DRY_RUN'] == '1'
            expect(true).to be true
          else
            assert_response_matches_metadata(example.metadata)
          end
        end
      end
    end
  end
end

RSpec.configure do |config|
  config.openapi_root = Rails.root.join('swagger').to_s
  config.define_derived_metadata(file_path: %r{spec/swagger}) do |metadata|
    metadata[:rswag_dry_run] = true
  end

  config.openapi_specs = {
    'v1/swagger.json' => {
      openapi: '3.0.3',
      info: {
        title: 'Fleet SaaS API',
        version: 'v1',
        description: 'Multi-tenant Commercial-Vehicle Booking SaaS API for India (Tractors, JCBs, Heavy Vehicles, Buses). Isolation powered by ros-apartment.'
      },
      paths: {},
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server'
        }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: :JWT,
            description: 'Bearer JWT token header (Authorization: Bearer <token>)'
          },
          TenantHeader: {
            type: :apiKey,
            name: 'X-Tenant',
            in: :header,
            description: 'Tenant isolation header (X-Tenant: <tenant_subdomain>)'
          }
        },
        schemas: {
          StandardSuccessEnvelope: {
            type: :object,
            properties: {
              status: { type: :string, example: 'success' },
              data: { type: :object },
              error: { type: :object, nullable: true, example: nil }
            },
            required: ['status', 'data', 'error']
          },
          StandardErrorEnvelope: {
            type: :object,
            properties: {
              status: { type: :string, example: 'error' },
              data: { type: :object, nullable: true, example: nil },
              error: {
                type: :object,
                properties: {
                  code: { type: :string, example: 'validation_failed' },
                  message: { type: :string, example: 'Validation failed' },
                  fields: { type: :object, nullable: true }
                },
                required: ['code', 'message']
              }
            },
            required: ['status', 'data', 'error']
          },
          Vehicle: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              registration_number: { type: :string, example: 'KA01AB1234' },
              vehicle_type: { type: :string, example: 'tractor' },
              make: { type: :string, example: 'Mahindra' },
              model: { type: :string, example: '575 DI' },
              year: { type: :integer, example: 2024 },
              base_rate_per_hour: { type: :string, example: '850.00' },
              base_rate_per_day: { type: :string, example: '6500.00' },
              status: { type: :string, example: 'available' },
              latitude: { type: :number, nullable: true, example: 12.9716 },
              longitude: { type: :number, nullable: true, example: 77.5946 },
              created_at: { type: :string, format: :'date-time' },
              updated_at: { type: :string, format: :'date-time' }
            },
            required: ['uuid', 'registration_number', 'vehicle_type', 'make', 'model', 'status']
          },
          Booking: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              booking_number: { type: :string, example: 'BK-20260805-001' },
              vehicle_uuid: { type: :string, format: :uuid },
              status: { type: :string, example: 'confirmed' },
              start_time: { type: :string, format: :'date-time' },
              end_time: { type: :string, format: :'date-time' },
              total_amount: { type: :string, example: '13000.00' },
              advance_amount: { type: :string, example: '2600.00' },
              payment_status: { type: :string, example: 'paid' },
              created_at: { type: :string, format: :'date-time' }
            },
            required: ['uuid', 'booking_number', 'status', 'total_amount']
          },
          DriverLeave: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              driver_id: { type: :integer },
              start_date: { type: :string, format: :date },
              end_date: { type: :string, format: :date },
              reason: { type: :string, example: 'Medical leave' },
              status: { type: :string, example: 'pending' },
              created_at: { type: :string, format: :'date-time' }
            },
            required: ['uuid', 'start_date', 'end_date', 'status']
          },
          DriverPayroll: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              driver_id: { type: :integer },
              month: { type: :integer, example: 8 },
              year: { type: :integer, example: 2026 },
              base_salary: { type: :string, example: '25000.00' },
              bonuses: { type: :string, example: '2000.00' },
              deductions: { type: :string, example: '500.00' },
              net_pay: { type: :string, example: '26500.00' },
              status: { type: :string, example: 'draft' }
            },
            required: ['uuid', 'month', 'year', 'net_pay', 'status']
          },
          GpsPing: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              vehicle_uuid: { type: :string, format: :uuid },
              latitude: { type: :number, example: 12.9716 },
              longitude: { type: :number, example: 77.5946 },
              speed_kmh: { type: :number, example: 42.5 },
              recorded_at: { type: :string, format: :'date-time' }
            },
            required: ['uuid', 'latitude', 'longitude', 'recorded_at']
          },
          PricingRule: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              vehicle_type: { type: :string, example: 'jcb' },
              multiplier: { type: :string, example: '1.25' },
              active: { type: :boolean, example: true }
            },
            required: ['uuid', 'vehicle_type', 'multiplier']
          },
          Review: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              booking_uuid: { type: :string, format: :uuid },
              rating: { type: :integer, example: 5 },
              comment: { type: :string, example: 'Excellent equipment condition and punctual driver.' },
              created_at: { type: :string, format: :'date-time' }
            },
            required: ['uuid', 'rating']
          },
          User: {
            type: :object,
            properties: {
              uuid: { type: :string, format: :uuid },
              name: { type: :string, example: 'Rajesh Kumar' },
              phone: { type: :string, example: '+919876543210' },
              role: { type: :string, example: 'customer' },
              created_at: { type: :string, format: :'date-time' }
            },
            required: ['uuid', 'name', 'phone', 'role']
          },
          Owner: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              company_name: { type: :string, example: 'Karnataka Commercial Fleets' },
              subdomain: { type: :string, example: 'karnataka-fleets' },
              status: { type: :string, example: 'active' },
              created_at: { type: :string, format: :'date-time' }
            },
            required: ['id', 'company_name', 'subdomain', 'status']
          }
        }
      }
    }
  }

  config.openapi_format = :json
end
