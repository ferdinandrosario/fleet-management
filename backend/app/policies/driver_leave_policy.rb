# Authorization policy for driver leave applications (Session 9).
class DriverLeavePolicy < ApplicationPolicy
  def index?
    return true if user.driver? || user.owner_admin?

    false
  end

  def create?
    return true if user.driver?

    false
  end

  def update_status?
    return true if user.owner_admin?

    false
  end
end
