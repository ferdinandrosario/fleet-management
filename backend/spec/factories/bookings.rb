FactoryBot.define do
  factory :booking do
    vehicle
    association :customer, factory: :user
    start_time { 2.hours.from_now }
    end_time { 6.hours.from_now }
    pickup_address { "123 Main St, Madurai, Tamil Nadu" }
    pickup_latitude { 9.9252 }
    pickup_longitude { 78.1198 }
    status { :pending_payment }
    payment_status { :pending }
    total_paise { 400000 }
    advance_paise { 80000 }
    sequence(:razorpay_order_id) { |n| "order_test_#{n}" }
  end
end
