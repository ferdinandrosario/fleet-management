# Customer review submission and rating aggregation service (Session 8).
class ReviewService
  Result = Struct.new(:success, :review, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def create_review(booking:, customer:, rating:, comment: nil, completion_photo_url: nil)
      if booking.nil? || customer.nil?
        return Result.new(success: false, errors: { booking: [ "booking and customer are required" ] })
      end

      unless booking.completed?
        return Result.new(success: false, errors: { booking: [ "must be completed to submit a review" ] })
      end

      if booking.customer_id != customer.id
        return Result.new(success: false, errors: { customer: [ "is not the owner of this booking" ] })
      end

      if booking.review&.persisted?
        return Result.new(success: false, errors: { booking: [ "has already been reviewed" ] })
      end

      review = booking.build_review(
        vehicle: booking.vehicle,
        customer: customer,
        driver: booking.driver,
        rating: rating.to_i,
        comment: comment,
        completion_photo_url: completion_photo_url
      )

      if review.save
        booking.vehicle.update_rating_stats!
        Result.new(success: true, review: review)
      else
        Result.new(success: false, errors: review.errors.to_hash)
      end
    end
  end
end
