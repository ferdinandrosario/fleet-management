FactoryBot.define do
  factory :vehicle_availability do
    association :vehicle
    start_time { 1.day.from_now }
    end_time { 2.days.from_now }
    reason { :maintenance }
  end
end
