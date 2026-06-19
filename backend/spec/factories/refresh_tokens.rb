FactoryBot.define do
  factory :refresh_token do
    user
    jti { SecureRandom.uuid }
    family { SecureRandom.uuid }
    expires_at { 30.days.from_now }
  end
end
