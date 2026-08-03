# Policy for subscription plan tier operations (Session 4).
# Only authenticated SuperAdmins can manage plans via platform admin APIs.
class PlanPolicy < ApplicationPolicy
  def index? = super_admin?
  def show? = super_admin?
  def create? = super_admin?
  def update? = super_admin?

  private

  def super_admin?
    Current.super_admin.present?
  end
end
