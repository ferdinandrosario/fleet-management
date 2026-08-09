# Creates commercial vehicle bookings and generates advance payment order payloads (Session 6).
class BookingService
  Result = Struct.new(:success, :booking, :razorpay_order, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def call(customer:, vehicle:, start_time:, end_time:, pickup_address: nil, pickup_latitude: nil, pickup_longitude: nil)
      st = Time.zone.parse(start_time.to_s) rescue nil
      et = Time.zone.parse(end_time.to_s) rescue nil

      if st.nil? || et.nil? || et <= st
        return Result.new(success: false, errors: { end_time: [ "must be after start time" ] })
      end

      if vehicle.status != "available"
        return Result.new(success: false, errors: { vehicle: [ "is not available for booking" ] })
      end

      owner = Apartment::Tenant.current == "public" ? nil : Owner.find_by(slug: Current.tenant || Apartment::Tenant.current)
      if owner
        limit_check = PlanLimitService.check(owner, :bookings, current_count: Booking.where("created_at >= ?", Time.current.beginning_of_month).count)
        unless limit_check.allowed?
          return Result.new(success: false, errors: { plan: [ "Monthly plan booking limit reached" ] })
        end
      end

      # Serialize concurrent booking requests for this vehicle to prevent double bookings
      vehicle.with_lock do
        # Check availability conflicts inside lock
        has_hold = vehicle.vehicle_availabilities.where("start_time < ? AND end_time > ?", et, st).exists?
        has_booking = vehicle.bookings.active.overlapping_range(st, et).exists?

        if has_hold || has_booking
          return Result.new(success: false, errors: { vehicle: [ "is already booked or unavailable for selected time range" ] })
        end

        # Calculate pricing quote
        duration_hours = ((et - st) / 1.hour).ceil
        days = duration_hours / 24
        hours = duration_hours % 24

        quote = PricingCalculatorService.call(vehicle: vehicle, hours: hours, days: days, date: st.to_date)
        total_paise = quote.final_paise

        # Require advance token payment (configurable %, minimum configurable paise)
        advance_pct = ENV.fetch("BOOKING_ADVANCE_PERCENTAGE", 0.20).to_f
        min_advance = ENV.fetch("BOOKING_ADVANCE_MINIMUM_PAISE", 50000).to_i
        advance_paise = [ (total_paise * advance_pct).round, min_advance ].max
        advance_paise = total_paise if advance_paise > total_paise

        razorpay_order_id = "order_#{SecureRandom.hex(10)}"

        booking = vehicle.bookings.new(
          customer: customer,
          start_time: st,
          end_time: et,
          pickup_address: pickup_address,
          pickup_latitude: pickup_latitude,
          pickup_longitude: pickup_longitude,
          total_paise: total_paise,
          advance_paise: advance_paise,
          status: :pending_payment,
          payment_status: :pending,
          razorpay_order_id: razorpay_order_id
        )

        if booking.save
          razorpay_payload = {
            order_id: razorpay_order_id,
            amount_paise: advance_paise,
            currency: "INR",
            customer_name: customer.name,
            customer_phone: customer.phone
          }

          Result.new(success: true, booking: booking, razorpay_order: razorpay_payload)
        else
          Result.new(success: false, errors: booking.errors.to_hash)
        end
      end
    end
  end
end
