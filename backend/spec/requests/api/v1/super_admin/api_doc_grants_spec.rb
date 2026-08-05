require 'rails_helper'

RSpec.describe 'Api::V1::SuperAdmin::ApiDocGrants', type: :request do
  let(:super_admin) { SuperAdmin.create!(email: 'admin@example.com', password: 'password123') }
  let(:headers) do
    { 'Authorization' => 'Bearer fake-token' }
  end

  before do
    allow(JwtService).to receive(:decode).with('fake-token').and_return({
      'type' => 'access',
      'role' => 'super_admin',
      'tenant' => 'public',
      'sub' => super_admin.uuid
    })
  end

  describe 'GET /api/v1/super_admin/api_doc_grants' do
    it 'returns a list of grants' do
      ApiDocGrant.create!(email: 'dev@example.com', expires_at: 1.day.from_now)
      get '/api/v1/super_admin/api_doc_grants', headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data'].length).to eq(1)
      expect(json['data'][0]['email']).to eq('dev@example.com')
    end
  end

  describe 'POST /api/v1/super_admin/api_doc_grants' do
    it 'creates a new grant with default hours if not provided or <= 0' do
      post '/api/v1/super_admin/api_doc_grants', params: { email: 'dev@example.com', expires_in_hours: -1 }, headers: headers
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['data']['email']).to eq('dev@example.com')
      expect(json['data']['token']).to be_present
    end

    it 'creates a new grant with specified hours' do
      post '/api/v1/super_admin/api_doc_grants', params: { email: 'dev@example.com', expires_in_hours: 2 }, headers: headers
      expect(response).to have_http_status(:created)
    end

    it 'returns unprocessable_entity if validation fails' do
      post '/api/v1/super_admin/api_doc_grants', params: { email: 'invalid', expires_in_hours: 24 }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['error']['code']).to eq('validation_failed')
    end
  end

  describe 'DELETE /api/v1/super_admin/api_doc_grants/:id' do
    it 'deletes a grant' do
      grant = ApiDocGrant.create!(email: 'dev@example.com', expires_at: 1.day.from_now)
      delete "/api/v1/super_admin/api_doc_grants/#{grant.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(ApiDocGrant.exists?(grant.id)).to be false
    end
  end
end
