FactoryBot.define do
  factory :subscription do
    owner
    status { :incomplete }
  end
end
