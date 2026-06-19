# A user may act only on their own account (show/update profile, logout).
class UserPolicy < ApplicationPolicy
  def show? = owner?
  def update? = owner?
  def logout? = owner?

  private

  def owner?
    user == record
  end
end
