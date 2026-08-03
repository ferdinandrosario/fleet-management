# Authorization policy for driver payroll settlements (Session 9).
class DriverPayrollPolicy < ApplicationPolicy
  def index?
    return true if user.driver? || user.owner_admin?

    false
  end

  def calculate?
    return true if user.owner_admin?

    false
  end

  def pay?
    return true if user.owner_admin?

    false
  end
end
