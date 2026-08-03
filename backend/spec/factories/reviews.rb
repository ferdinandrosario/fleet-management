FactoryBot.define do
  factory :review do
    booking
    vehicle { booking.vehicle }
    customer { booking.customer }
    driver { booking.driver }
    rating { 5 }
    comment { "Excellent tractor operation and prompt service!" }
    completion_photo_url { "https://cdn.fleetapp.in/proofs/job_123.jpg" }
  end
end
