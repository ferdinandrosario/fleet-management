# Default-deny base policy: every action is forbidden unless a subclass opens
# it. No policy / no explicit allow ⇒ no access. Role + tenant come from the
# verified token (Current.user), never from params.
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index? = false
  def show? = false
  def create? = false
  def update? = false
  def destroy? = false

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      raise NoMethodError, "#{self.class} must implement #resolve"
    end

    private

    attr_reader :user, :scope
  end
end
