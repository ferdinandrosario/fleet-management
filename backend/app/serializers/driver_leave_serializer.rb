# Serializes driver leave applications (Session 9).
module DriverLeaveSerializer
  module_function

  def call(leave)
    return nil if leave.nil?

    {
      id: leave.uuid,
      driver_id: leave.driver.uuid,
      driver_name: leave.driver.name,
      start_date: leave.start_date.iso8601,
      end_date: leave.end_date.iso8601,
      reason: leave.reason,
      status: leave.status,
      approved_by_name: leave.approved_by&.name,
      created_at: leave.created_at.iso8601
    }
  end
end
