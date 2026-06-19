FactoryBot.define do
  factory :one_time_password do
    user
    code_digest { BCrypt::Password.create("123456") }
    expires_at { 10.minutes.from_now }
  end
end
