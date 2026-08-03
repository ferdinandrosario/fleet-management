# Real-time GPS ping record for active vehicle booking (tenant schema).
class GpsPing < ApplicationRecord
  include HasPublicUuid

  belongs_to :booking
  belongs_to :driver, class_name: "User"

  validates :latitude, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validates :recorded_at, presence: true

  scope :chronological, -> { order(recorded_at: :asc) }
  scope :latest_first, -> { order(recorded_at: :desc) }
end
