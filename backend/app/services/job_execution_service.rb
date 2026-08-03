# Manages driver assignment and job execution lifecycle (Session 7).
class JobExecutionService
  Result = Struct.new(:success, :booking, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def assign_driver(booking:, driver:)
      if booking.nil? || driver.nil?
        return Result.new(success: false, errors: { booking: [ "booking and driver are required" ] })
      end

      unless driver.driver?
        return Result.new(success: false, errors: { driver: [ "must have driver role" ] })
      end

      if booking.completed? || booking.cancelled?
        return Result.new(success: false, errors: { booking: [ "cannot assign driver to closed booking" ] })
      end

      booking.update!(driver: driver)
      Result.new(success: true, booking: booking)
    end

    def start_job(booking:, driver:, start_meter_reading:)
      if booking.nil? || driver.nil?
        return Result.new(success: false, errors: { booking: [ "booking and driver are required" ] })
      end

      unless booking.confirmed?
        return Result.new(success: false, errors: { booking: [ "must be in confirmed state to start job" ] })
      end

      if booking.driver_id != driver.id
        return Result.new(success: false, errors: { driver: [ "is not assigned to this booking" ] })
      end

      meter = start_meter_reading.to_f rescue 0.0
      if start_meter_reading.blank? || meter < 0
        return Result.new(success: false, errors: { start_meter_reading: [ "must be greater than or equal to 0" ] })
      end

      booking.update!(
        status: :in_progress,
        start_meter_reading: meter,
        job_started_at: Time.current
      )

      Result.new(success: true, booking: booking)
    end

    def finish_job(booking:, driver:, end_meter_reading:)
      if booking.nil? || driver.nil?
        return Result.new(success: false, errors: { booking: [ "booking and driver are required" ] })
      end

      unless booking.in_progress?
        return Result.new(success: false, errors: { booking: [ "must be in_progress to finish job" ] })
      end

      if booking.driver_id != driver.id
        return Result.new(success: false, errors: { driver: [ "is not assigned to this booking" ] })
      end

      meter = end_meter_reading.to_f rescue 0.0
      start_meter = booking.start_meter_reading.to_f

      if end_meter_reading.blank? || meter < start_meter
        return Result.new(success: false, errors: { end_meter_reading: [ "must be greater than or equal to start meter reading (#{start_meter})" ] })
      end

      booking.update!(
        status: :completed,
        end_meter_reading: meter,
        job_finished_at: Time.current
      )

      Result.new(success: true, booking: booking)
    end
  end
end
