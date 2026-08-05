class ApiDocGrantPolicy < ApplicationPolicy
  def index?
    user.is_a?(SuperAdmin)
  end

  def create?
    user.is_a?(SuperAdmin)
  end

  def destroy?
    user.is_a?(SuperAdmin)
  end
end
