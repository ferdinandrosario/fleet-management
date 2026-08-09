# Customer booking reservation for a commercial vehicle (tenant schema).
# Manages reservation state lifecycle and advance payment integration.
class Booking < ApplicationRecord
  include HasPublicUuid

  belongs_to :vehicle
  belongs_to :customer, class_name: "User"
  belongs_to :driver, class_name: "User", optional: true
  has_many :gps_pings, dependent: :destroy
  has_one :review, dependent: :destroy

  enum :status, {
    pending_payment: 0, confirmed: 1, in_progress: 2, completed: 3, cancelled: 4
  }, default: :pending_payment

  enum :payment_status, {
    pending: 0, advance_paid: 1, fully_paid: 2, refunded: 3
  }, default: :pending

  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :total_paise, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :advance_paise, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :start_meter_reading, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :end_meter_reading, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validate :end_time_after_start_time

  scope :active, -> { where(status: [ :pending_payment, :confirmed, :in_progress ]) }
  scope :overlapping_range, ->(start_t, end_t) {
    where("start_time < ? AND end_time > ?", end_t, start_t)
  }

  private

  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?

    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
end
