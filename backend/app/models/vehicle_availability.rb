# Vehicle availability block / hold (tenant schema).
# Defines maintenance periods, active bookings, or owner manual holds.
class VehicleAvailability < ApplicationRecord
  include HasPublicUuid

  belongs_to :vehicle

  enum :reason, {
    maintenance: 0, booked: 1, owner_hold: 2
  }, default: :maintenance

  validates :start_time, presence: true
  validates :end_time, presence: true
  validate :end_time_after_start_time
  validate :no_overlapping_blocks

  private

  def no_overlapping_blocks
    return if start_time.blank? || end_time.blank? || vehicle_id.blank?

    has_hold = VehicleAvailability.where(vehicle_id: vehicle_id)
                                  .where("start_time < ? AND end_time > ?", end_time, start_time)
                                  .where.not(id: id)
                                  .exists?

    has_booking = Booking.active
                         .where(vehicle_id: vehicle_id)
                         .overlapping_range(start_time, end_time)
                         .exists?

    if has_hold || has_booking
      errors.add(:vehicle, "is already booked or unavailable for selected time range")
    end
  end

  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?

    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
end
