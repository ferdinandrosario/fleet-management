# Serializes customer vehicle reviews and completion proof photos (Session 8).
module ReviewSerializer
  module_function

  def call(review)
    return nil if review.nil?

    {
      id: review.uuid,
      booking_id: review.booking.uuid,
      vehicle_id: review.vehicle.uuid,
      rating: review.rating,
      comment: review.comment,
      completion_photo_url: review.completion_photo_url,
      customer_name: review.customer.name,
      driver_name: review.driver&.name,
      created_at: review.created_at.iso8601
    }
  end
end
