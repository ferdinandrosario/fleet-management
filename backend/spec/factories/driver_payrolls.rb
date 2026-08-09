FactoryBot.define do
  factory :driver_payroll do
    association :driver, factory: :user
    period_start { 7.days.ago.to_date }
    period_end { Date.current }
    completed_jobs_count { 5 }
    total_hours_worked { 32.5 }
    base_pay_paise { 1500000 }
    bonus_paise { 50000 }
    deductions_paise { 0 }
    total_payout_paise { 1550000 }
    status { :draft }
  end
end
