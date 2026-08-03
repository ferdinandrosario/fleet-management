# Policy for owner subscription operations (Session 4).
# Only authenticated SuperAdmins can manage subscriptions via platform admin APIs.
class SubscriptionPolicy < ApplicationPolicy
  def show? = super_admin?
  def update? = super_admin?

  private

  def super_admin?
    Current.super_admin.present?
  end
end
