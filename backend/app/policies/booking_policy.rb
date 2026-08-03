# Authorization policy for vehicle bookings (Session 6 & 7).
class BookingPolicy < ApplicationPolicy
  def index? = user.present?
  def create? = user.present?

  def show? = owner_or_party?
  def pay_advance? = owner_or_customer?
  def cancel? = owner_or_customer?

  def assign_driver? = user.owner_admin?
  def start_job? = owner_or_assigned_driver?
  def finish_job? = owner_or_assigned_driver?
  def record_gps? = owner_or_assigned_driver?
  def view_tracking? = owner_or_party?

  private

  def owner_or_party?
    return true if user.owner_admin?
    return true if record.customer_id == user.id
    return true if record.driver_id == user.id

    false
  end

  def owner_or_customer?
    return true if user.owner_admin?
    return true if record.customer_id == user.id

    false
  end

  def owner_or_assigned_driver?
    return true if user.owner_admin?
    return true if record.driver_id == user.id

    false
  end
end
