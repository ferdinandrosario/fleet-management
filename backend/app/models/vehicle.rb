# Vehicle listing (tenant schema). Isolated per owner tenant via ros-apartment.
# Represents tractors, JCBs, heavy vehicles, buses, cranes, and harvesters.
class Vehicle < ApplicationRecord
  include HasPublicUuid

  belongs_to :vehicle_model, optional: true

  has_many :vehicle_availabilities, dependent: :destroy
  has_many :pricing_rules, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :reviews, dependent: :destroy

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

  # PostGIS spatial scopes using on-the-fly geography casting
  scope :within_radius, ->(lat, lng, radius_km) {
    where("latitude IS NULL OR longitude IS NULL OR ST_DWithin(ST_MakePoint(longitude, latitude)::geography, ST_MakePoint(:lng, :lat)::geography, :radius_m)",
          lng: lng.to_f, lat: lat.to_f, radius_m: radius_km.to_f * 1000)
  }

  scope :with_distance_from, ->(lat, lng) {
    select("vehicles.*, CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN (ST_Distance(ST_MakePoint(longitude, latitude)::geography, ST_MakePoint(#{lng.to_f}, #{lat.to_f})::geography) / 1000.0) ELSE 999999.0 END AS distance")
  }

  # Recalculates average rating and review count from submitted reviews
  def update_rating_stats!
    cnt, avg = reviews.pick(Arel.sql("COUNT(*)"), Arel.sql("AVG(rating)"))

    cnt = cnt.to_i
    avg = cnt.positive? ? avg.to_f.round(2) : 0.0

    update_columns(reviews_count: cnt, average_rating: avg)
  end



  private

  def normalize_registration_number
    self.registration_number = registration_number.to_s.strip.upcase.presence
  end
end
