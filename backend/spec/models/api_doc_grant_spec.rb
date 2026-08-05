require 'rails_helper'

RSpec.describe ApiDocGrant, type: :model do
  describe 'validations' do
    it 'validates presence and format of email' do
      grant = ApiDocGrant.new(email: 'invalid', expires_at: 1.day.from_now)
      expect(grant.valid?).to be false
      expect(grant.errors[:email]).to include('is invalid')

      grant.email = 'dev@example.com'
      expect(grant.valid?).to be true
    end

    it 'validates presence of expires_at' do
      grant = ApiDocGrant.new(email: 'dev@example.com')
      expect(grant.valid?).to be false
      expect(grant.errors[:expires_at]).to include("can't be blank")
    end
  end

  describe 'token generation' do
    it 'generates a secure token on creation' do
      grant = ApiDocGrant.create!(email: 'dev@example.com', expires_at: 1.day.from_now)
      expect(grant.token).to be_present
      expect(grant.token.length).to eq(24)
    end
  end

  describe '.active' do
    it 'returns only active grants' do
      active = ApiDocGrant.create!(email: 'dev1@example.com', expires_at: 1.day.from_now)
      expired = ApiDocGrant.create!(email: 'dev2@example.com', expires_at: 1.day.ago)

      expect(ApiDocGrant.active).to include(active)
      expect(ApiDocGrant.active).not_to include(expired)
    end
  end

  describe '#active?' do
    it 'returns true if expires_at is in the future' do
      grant = ApiDocGrant.new(expires_at: 1.day.from_now)
      expect(grant.active?).to be true
    end

    it 'returns false if expires_at is in the past' do
      grant = ApiDocGrant.new(expires_at: 1.day.ago)
      expect(grant.active?).to be false
    end
  end
end
