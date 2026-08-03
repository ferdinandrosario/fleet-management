FactoryBot.define do
  factory :pricing_rule do
    association :vehicle
    min_duration_hours { 10 }
    discount_percentage { 10.0 }
    active { true }
  end
end
