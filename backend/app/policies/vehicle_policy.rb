# Authorization policy for vehicles (Session 5).
class VehiclePolicy < ApplicationPolicy
  def index? = user.present?
  def show? = user.present?
  def calculate_quote? = user.present?

  def create? = owner_admin?
  def update? = owner_admin?
  def destroy? = owner_admin?

  private

  def owner_admin?
    user&.owner_admin?
  end
end
