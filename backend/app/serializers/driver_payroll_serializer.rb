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
      base_pay_cents: payroll.base_pay_cents,
      bonus_cents: payroll.bonus_cents,
      deductions_cents: payroll.deductions_cents,
      total_payout_cents: payroll.total_payout_cents,
      status: payroll.status,
      created_at: payroll.created_at.iso8601
    }
  end
end
