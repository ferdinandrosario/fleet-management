# Policy for owner/tenant operations (Session 4).
# Only authenticated SuperAdmins can manage owners via platform admin APIs.
class OwnerPolicy < ApplicationPolicy
  def index? = super_admin?
  def show? = super_admin?
  def create? = super_admin?
  def update? = super_admin?
  def update_status? = super_admin?

  private

  def super_admin?
    Current.super_admin.present?
  end
end
