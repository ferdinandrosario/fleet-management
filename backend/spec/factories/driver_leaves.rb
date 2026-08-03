FactoryBot.define do
  factory :driver_leave do
    association :driver, factory: :user
    start_date { Date.current }
    end_date { Date.current + 2.days }
    reason { "Family function in native village" }
    status { :pending }
  end
end
