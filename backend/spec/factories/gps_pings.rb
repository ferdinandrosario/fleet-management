FactoryBot.define do
  factory :gps_ping do
    booking
    association :driver, factory: :user
    latitude { 9.9252 }
    longitude { 78.1198 }
    speed_kmh { 25.5 }
    recorded_at { Time.current }
  end
end
