FactoryBot.define do
  factory :driver_payroll do
    association :driver, factory: :user
    period_start { 7.days.ago.to_date }
    period_end { Date.current }
    completed_jobs_count { 5 }
    total_hours_worked { 32.5 }
    base_pay_cents { 1500000 }
    bonus_cents { 50000 }
    deductions_cents { 0 }
    total_payout_cents { 1550000 }
    status { :draft }
  end
end
