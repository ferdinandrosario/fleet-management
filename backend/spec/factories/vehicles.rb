FactoryBot.define do
  factory :vehicle do
    name { "Mahindra 575 DI" }
    category { :tractor }
    sequence(:registration_number) { |n| "TN-01-AB-#{1000 + n}" }
    model_year { 2023 }
    hourly_rate_cents { 50000 } # ₹500/hr
    daily_rate_cents { 350000 } # ₹3500/day
    status { :available }
    specs { { horsepower: 45, fuel_type: "diesel" } }
  end
end
