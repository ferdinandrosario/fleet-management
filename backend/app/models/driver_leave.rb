# Driver leave application and approval workflow (tenant schema).
class DriverLeave < ApplicationRecord
  include HasPublicUuid

  belongs_to :driver, class_name: "User"
  belongs_to :approved_by, class_name: "User", optional: true

  enum :status, { pending: 0, approved: 1, rejected: 2 }, default: :pending

  validates :start_date, presence: true
  validates :end_date, presence: true
  validate :end_date_after_start_date

  scope :chronological, -> { order(start_date: :desc) }

  private

  def end_date_after_start_date
    return if start_date.blank? || end_date.blank?

    if end_date < start_date
      errors.add(:end_date, "must be after or equal to start date")
    end
  end
end
