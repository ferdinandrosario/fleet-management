FactoryBot.define do
  factory :subscription do
    owner
    plan
    status { :active }
  end
end
