# Vehicle listing (tenant schema). Isolated per owner tenant via ros-apartment.
# Represents tractors, JCBs, heavy vehicles, buses, cranes, and harvesters.
class Vehicle < ApplicationRecord
  include HasPublicUuid

  has_many :vehicle_availabilities, dependent: :destroy
  has_many :pricing_rules, dependent: :destroy

  enum :category, {
    tractor: 0, jcb: 1, heavy_vehicle: 2, bus: 3, crane: 4, harvester: 5
  }, default: :tractor

  enum :status, {
    available: 0, booked: 1, maintenance: 2, inactive: 3
  }, default: :available

  before_validation :normalize_registration_number

  validates :name, presence: true
  validates :registration_number, presence: true, uniqueness: { case_sensitive: false }
  validates :hourly_rate_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :daily_rate_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :model_year, numericality: {
    only_integer: true,
    greater_than: 1900,
    less_than_or_equal_to: -> { Time.current.year + 1 }
  }, allow_nil: true

  scope :available_only, -> { where(status: :available) }
  scope :by_category, ->(cat) { where(category: cat) if cat.present? }

  private

  def normalize_registration_number
    self.registration_number = registration_number.to_s.strip.upcase.presence
  end
end
