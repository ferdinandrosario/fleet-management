# Vehicle listing (tenant schema). Isolated per owner tenant via ros-apartment.
# Represents tractors, JCBs, heavy vehicles, buses, cranes, and harvesters.
class Vehicle < ApplicationRecord
  include HasPublicUuid

  has_many :vehicle_availabilities, dependent: :destroy
  has_many :pricing_rules, dependent: :destroy
  has_many :bookings, dependent: :destroy

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
  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }, allow_nil: true
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, allow_nil: true

  scope :available_only, -> { where(status: :available) }
  scope :by_category, ->(cat) { where(category: cat) if cat.present? }

  # Calculates distance in kilometers between vehicle location and target coordinates using Haversine formula
  def distance_to(target_lat, target_lng)
    return nil if latitude.nil? || longitude.nil? || target_lat.nil? || target_lng.nil?

    rad_per_deg = Math::PI / 180
    rkm = 6371

    dlat_rad = (target_lat.to_f - latitude.to_f) * rad_per_deg
    dlon_rad = (target_lng.to_f - longitude.to_f) * rad_per_deg

    lat1_rad = latitude.to_f * rad_per_deg
    lat2_rad = target_lat.to_f * rad_per_deg

    a = (Math.sin(dlat_rad / 2)**2) + ((Math.sin(dlon_rad / 2)**2) * Math.cos(lat1_rad) * Math.cos(lat2_rad))
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    (rkm * c).round(2)
  end

  private

  def normalize_registration_number
    self.registration_number = registration_number.to_s.strip.upcase.presence
  end
end
