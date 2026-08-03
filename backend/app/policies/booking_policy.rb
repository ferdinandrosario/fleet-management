# Authorization policy for vehicle bookings (Session 6).
class BookingPolicy < ApplicationPolicy
  def index? = user.present?
  def create? = user.present?

  def show? = owner_or_party?
  def pay_advance? = owner_or_customer?
  def cancel? = owner_or_customer?

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
end
