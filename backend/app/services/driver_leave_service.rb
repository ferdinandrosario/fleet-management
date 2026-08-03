# Driver leave application and approval service (Session 9).
class DriverLeaveService
  Result = Struct.new(:success, :leave, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def apply_leave(driver:, start_date:, end_date:, reason: nil)
      if driver.nil?
        return Result.new(success: false, errors: { driver: [ "driver is required" ] })
      end

      unless driver.driver?
        return Result.new(success: false, errors: { driver: [ "must have driver role" ] })
      end

      leave = DriverLeave.new(
        driver: driver,
        start_date: start_date,
        end_date: end_date,
        reason: reason,
        status: :pending
      )

      if leave.save
        Result.new(success: true, leave: leave)
      else
        Result.new(success: false, errors: leave.errors.to_hash)
      end
    end

    def update_leave_status(leave:, approver:, status:)
      if leave.nil? || approver.nil?
        return Result.new(success: false, errors: { leave: [ "leave and approver are required" ] })
      end

      unless approver.owner_admin?
        return Result.new(success: false, errors: { approver: [ "must be an owner_admin" ] })
      end

      unless DriverLeave.statuses.key?(status.to_s)
        return Result.new(success: false, errors: { status: [ "invalid status" ] })
      end

      leave.status = status
      leave.approved_by = approver

      if leave.save
        Result.new(success: true, leave: leave)
      else
        Result.new(success: false, errors: leave.errors.to_hash)
      end
    end
  end
end
