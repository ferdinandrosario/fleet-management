FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "Customer #{n}" }
    sequence(:phone) { |n| format("+9198%09d", n) }
    password { "Str0ng$Pass1" }
    role { :customer }

    trait :verified do
      phone_verified_at { Time.current }
    end
  end
end
