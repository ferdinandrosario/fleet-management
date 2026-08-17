# Customer booking management and payment verification endpoints (Session 6).
module Api
  module V1
    class BookingsController < AuthenticatedController
      def index
        authorize Booking
        scope = if Current.user.owner_admin?
                  Booking.all
        elsif Current.user.driver?
                  Booking.where(driver_id: Current.user.id)
        else
                  Booking.where(customer_id: Current.user.id)
        end

        scope = scope.includes({ vehicle: :vehicle_model }, :customer, :driver).order(created_at: :desc)
        pagy, bookings = pagy(scope)

        render_success(
          data: {
            bookings: bookings.map { |b| BookingSerializer.call(b) },
            pagination: {
              page: pagy.page,
              pages: pagy.pages,
              count: pagy.count,
              limit: pagy.limit
            }
          }
        )
      end

      def show
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking
        render_success(data: { booking: BookingSerializer.call(booking) })
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def create
        authorize Booking
        vehicle = Vehicle.find_by!(uuid: params[:vehicle_id])

        result = BookingService.call(
          customer: Current.user,
          vehicle: vehicle,
          start_time: params[:start_time],
          end_time: params[:end_time],
          pickup_address: params[:pickup_address],
          pickup_latitude: params[:pickup_latitude],
          pickup_longitude: params[:pickup_longitude]
        )

        if result.success?
          render_success(
            data: {
              booking: BookingSerializer.call(result.booking),
              razorpay_order: result.razorpay_order
            },
            status: :created
          )
        else
          render_error(
            code: "booking_failed",
            message: I18n.t("errors.booking_failed", default: "Could not create booking"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def pay_advance
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking

        result = PaymentVerificationService.call(
          booking: booking,
          razorpay_payment_id: params[:razorpay_payment_id],
          razorpay_signature: params[:razorpay_signature]
        )

        if result.success?
          render_success(data: { booking: BookingSerializer.call(result.booking) })
        else
          render_error(
            code: "payment_failed",
            message: I18n.t("errors.payment_failed", default: "Payment verification failed"),
            status: :unprocessable_content,
            fields: result.errors
          )
        end
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end

      def cancel
        booking = Booking.find_by!(uuid: params[:id])
        authorize booking

        if booking.completed?
          return render_error(
            code: "invalid_transition",
            message: I18n.t("errors.cannot_cancel_completed", default: "Completed booking cannot be cancelled"),
            status: :unprocessable_content
          )
        end

        booking.cancelled!
        booking.update(payment_status: :refunded) if booking.advance_paid?

        render_success(data: { booking: BookingSerializer.call(booking) })
      rescue ActiveRecord::RecordNotFound
        skip_authorization
        render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
      end
    end
  end
end
