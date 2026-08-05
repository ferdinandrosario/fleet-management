class VehicleModel < ApplicationRecord
  include HasPublicUuid

  has_many :vehicles, dependent: :nullify

  enum :category, {
    tractor: 0, jcb: 1, heavy_vehicle: 2, bus: 3, crane: 4, harvester: 5
  }, default: :tractor

  validates :name, presence: true, uniqueness: { scope: :make, case_sensitive: false }
  validates :make, presence: true
end
