require 'rails_helper'
require 'rack/mock'

RSpec.describe ApiDocsAuth do
  let(:app) { ->(env) { [ 200, env, "app" ] } }
  let(:middleware) { described_class.new(app) }
  let(:mock_request) { Rack::MockRequest.new(middleware) }

  describe 'call' do
    it 'passes through if not /api-docs' do
      response = mock_request.get('/')
      expect(response.status).to eq(200)
    end

    it 'requires basic auth for /api-docs' do
      response = mock_request.get('/api-docs')
      expect(response.status).to eq(401)
    end

    it 'allows access with valid super admin credentials' do
      SuperAdmin.create!(email: 'admin@example.com', password: 'password123')
      headers = { 'HTTP_AUTHORIZATION' => ActionController::HttpAuthentication::Basic.encode_credentials('admin@example.com', 'password123') }
      response = mock_request.get('/api-docs', headers)
      expect(response.status).to eq(200)
    end

    it 'allows access with valid api doc grant' do
      grant = ApiDocGrant.create!(email: 'dev@example.com', expires_at: 1.day.from_now)
      headers = { 'HTTP_AUTHORIZATION' => ActionController::HttpAuthentication::Basic.encode_credentials('dev@example.com', grant.token) }
      response = mock_request.get('/api-docs', headers)
      expect(response.status).to eq(200)
    end

    it 'denies access with expired api doc grant' do
      grant = ApiDocGrant.create!(email: 'dev@example.com', expires_at: 1.day.from_now)
      grant.update_column(:expires_at, 1.day.ago)
      headers = { 'HTTP_AUTHORIZATION' => ActionController::HttpAuthentication::Basic.encode_credentials('dev@example.com', grant.token) }
      response = mock_request.get('/api-docs', headers)
      expect(response.status).to eq(401)
    end
  end
end
