# Serializes vehicle booking reservations (Session 6 & 7).
module BookingSerializer
  module_function

  def call(booking)
    return nil if booking.nil?

    {
      id: booking.uuid,
      vehicle: VehicleSerializer.call(booking.vehicle),
      customer: {
        id: booking.customer.uuid,
        name: booking.customer.name,
        phone: booking.customer.phone
      },
      driver: booking.driver ? { id: booking.driver.uuid, name: booking.driver.name } : nil,
      start_time: booking.start_time.iso8601,
      end_time: booking.end_time.iso8601,
      pickup_address: booking.pickup_address,
      pickup_latitude: booking.pickup_latitude,
      pickup_longitude: booking.pickup_longitude,
      status: booking.status,
      payment_status: booking.payment_status,
      total_paise: booking.total_paise,
      advance_paise: booking.advance_paise,
      start_meter_reading: booking.start_meter_reading,
      end_meter_reading: booking.end_meter_reading,
      job_started_at: booking.job_started_at&.iso8601,
      job_finished_at: booking.job_finished_at&.iso8601,
      razorpay_order_id: booking.razorpay_order_id,
      created_at: booking.created_at.iso8601
    }
  end
end
