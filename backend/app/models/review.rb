# Customer review and completion photo proof for commercial vehicle bookings (tenant schema).
class Review < ApplicationRecord
  include HasPublicUuid

  belongs_to :booking
  belongs_to :vehicle
  belongs_to :customer, class_name: "User"
  belongs_to :driver, class_name: "User", optional: true

  validates :rating, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
  validates :booking_id, uniqueness: true

  scope :chronological, -> { order(created_at: :desc) }
end
