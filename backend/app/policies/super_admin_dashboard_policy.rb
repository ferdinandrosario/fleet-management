# Authorization policy for platform super admin metrics dashboard (Session 10).
class SuperAdminDashboardPolicy < ApplicationPolicy
  def show?
    return true if user.is_a?(SuperAdmin)

    false
  end
end
