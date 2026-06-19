FactoryBot.define do
  factory :tenant_registry do
    owner
    sequence(:slug) { |n| "acme_#{n}" }
    sequence(:schema_name) { |n| "acme_#{n}" }
  end
end
