FactoryBot.define do
  factory :owner do
    sequence(:name) { |n| "Acme Equipment #{n}" }
    sequence(:slug) { |n| "acme_#{n}" }
    status { :pending }
  end
end
