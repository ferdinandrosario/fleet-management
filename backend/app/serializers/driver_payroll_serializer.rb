# Serializes driver payroll records (Session 9).
module DriverPayrollSerializer
  module_function

  def call(payroll)
    return nil if payroll.nil?

    {
      id: payroll.uuid,
      driver_id: payroll.driver.uuid,
      driver_name: payroll.driver.name,
      period_start: payroll.period_start.iso8601,
      period_end: payroll.period_end.iso8601,
      completed_jobs_count: payroll.completed_jobs_count,
      total_hours_worked: payroll.total_hours_worked.to_f,
      base_pay_paise: payroll.base_pay_paise,
      bonus_paise: payroll.bonus_paise,
      deductions_paise: payroll.deductions_paise,
      total_payout_paise: payroll.total_payout_paise,
      status: payroll.status,
      created_at: payroll.created_at.iso8601
    }
  end
end
