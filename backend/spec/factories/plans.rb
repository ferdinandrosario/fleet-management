FactoryBot.define do
  factory :plan do
    sequence(:name) { |n| "Plan #{n}" }
    tier { :basic }
    price_paise { 10000 }
    interval { :monthly }
    limits { { "vehicles" => 5 } }
    active { true }
  end
end
