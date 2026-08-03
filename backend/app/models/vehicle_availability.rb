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

  private

  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?

    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
end
