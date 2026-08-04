FactoryBot.define do
  factory :owner do
    sequence(:name) { |n| "Rajesh Owner #{n}" }
    sequence(:company_name) { |n| "Acme Logistics Pvt Ltd #{n}" }
    address { "123 Business Park, MG Road, Bengaluru" }
    sequence(:slug) { |n| "acme_#{n}" }
    status { :pending }
  end
end
