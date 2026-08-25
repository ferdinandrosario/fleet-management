# Customer review submission and vehicle review listing endpoints (Session 8).
module Api
  module V1
    class ReviewsController < AuthenticatedController
      def create
        booking = Booking.find_by!(uuid: params[:id])
        review = booking.build_review(customer: Current.user)
        authorize review, :create?

        result = ReviewService.create_review(
          booking: booking,
          customer: Current.user,
          rating: params[:rating],
          comment: params[:comment],
          completion_photo_url: params[:completion_photo_url]
        )

        if result.success?
          render_success(data: { review: ReviewSerializer.call(result.review) }, status: :created)
        else
          render_error(
            code: "review_creation_failed",
            message: I18n.t("errors.review_creation_failed", default: "Could not create review"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def vehicle_reviews
        vehicle = Vehicle.find_by!(uuid: params[:id])
        authorize Review, :index?

        scope = vehicle.reviews.includes(:booking, :customer, :driver, :vehicle).chronological
        pagy, reviews = pagy(scope)

        render_success(
          data: {
            vehicle_id: vehicle.uuid,
            average_rating: vehicle.average_rating.to_f,
            reviews_count: vehicle.reviews_count,
            reviews: reviews.map { |r| ReviewSerializer.call(r) },
            pagination: {
              page: pagy.page,
              pages: pagy.pages,
              count: pagy.count,
              limit: pagy.limit
            }
          }
        )
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end
    end
  end
end
