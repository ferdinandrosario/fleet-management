# Driver payroll settlement record per working period (tenant schema).
class DriverPayroll < ApplicationRecord
  include HasPublicUuid

  belongs_to :driver, class_name: "User"

  enum :status, { draft: 0, approved: 1, paid: 2 }, default: :draft

  validates :period_start, presence: true
  validates :period_end, presence: true
  validates :completed_jobs_count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :total_hours_worked, numericality: { greater_than_or_equal_to: 0 }
  validates :base_pay_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :bonus_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :deductions_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :total_payout_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :period_end_after_period_start

  scope :chronological, -> { order(period_start: :desc) }

  private

  def period_end_after_period_start
    return if period_start.blank? || period_end.blank?

    if period_end < period_start
      errors.add(:period_end, "must be after or equal to period start date")
    end
  end
end
