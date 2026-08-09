# Driver payroll calculation and settlement service (Session 9).
class PayrollService
  Result = Struct.new(:success, :payroll, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def calculate_payroll(driver:, period_start:, period_end:, bonus_paise: 0, deductions_paise: 0)
      if driver.nil?
        return Result.new(success: false, errors: { driver: [ "driver is required" ] })
      end

      unless driver.driver?
        return Result.new(success: false, errors: { driver: [ "must have driver role" ] })
      end

      if period_start.blank? || period_end.blank?
        return Result.new(success: false, errors: { period: [ "period_start and period_end are required" ] })
      end

      start_t = Date.parse(period_start.to_s).beginning_of_day
      end_t = Date.parse(period_end.to_s).end_of_day

      completed_bookings = Booking.where(driver_id: driver.id, status: :completed)
                                  .where(job_finished_at: start_t..end_t)
                                  .where.not(job_started_at: nil, job_finished_at: nil)

      jobs_count = completed_bookings.count

      # Calculate total hours using SQL EXTRACT(EPOCH) for seconds difference
      total_seconds = completed_bookings.sum("EXTRACT(EPOCH FROM (job_finished_at - job_started_at))")
      total_hours = (total_seconds / 3600.0)

      base_pay_sum = (completed_bookings.sum(:total_paise) * 0.40).round

      b_paise = bonus_paise.to_i
      d_paise = deductions_paise.to_i
      total_payout = [ base_pay_sum + b_paise - d_paise, 0 ].max

      payroll = DriverPayroll.new(
        driver: driver,
        period_start: period_start,
        period_end: period_end,
        completed_jobs_count: jobs_count,
        total_hours_worked: total_hours.round(2),
        base_pay_paise: base_pay_sum,
        bonus_paise: b_paise,
        deductions_paise: d_paise,
        total_payout_paise: total_payout,
        status: :draft
      )

      if payroll.save
        Result.new(success: true, payroll: payroll)
      else
        Result.new(success: false, errors: payroll.errors.to_hash)
      end
    end

    def mark_as_paid(payroll:)
      if payroll.nil?
        return Result.new(success: false, errors: { payroll: [ "payroll is required" ] })
      end

      if payroll.paid?
        return Result.new(success: false, errors: { payroll: [ "is already paid" ] })
      end

      payroll.status = :paid

      if payroll.save
        Result.new(success: true, payroll: payroll)
      else
        Result.new(success: false, errors: payroll.errors.to_hash)
      end
    end
  end
end
