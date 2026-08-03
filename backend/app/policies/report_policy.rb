# Authorization policy for owner reporting and exports (Session 10).
class ReportPolicy < ApplicationPolicy
  def dashboard?
    return true if user.owner_admin?

    false
  end

  def bookings_csv?
    return true if user.owner_admin?

    false
  end
end
