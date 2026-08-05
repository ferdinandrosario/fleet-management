FactoryBot.define do
  factory :vehicle_model do
    name { "MyString" }
    make { "MyString" }
    category { 1 }
    active { false }
  end
end
