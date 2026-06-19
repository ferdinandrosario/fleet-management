FactoryBot.define do
  factory :super_admin do
    sequence(:email) { |n| "admin#{n}@fleet.test" }
    password { "Sup3r$ecretPass" }
  end
end
