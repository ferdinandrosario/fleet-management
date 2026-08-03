# Enforces resource caps defined by subscription plans (Session 4).
# A nil limit in Plan#limits means unlimited for that resource.
class PlanLimitService
  class PlanLimitExceededError < StandardError
    attr_reader :resource, :limit, :current

    def initialize(resource:, limit:, current:)
      @resource = resource
      @limit = limit
      @current = current
      super("Plan limit of #{limit} exceeded for #{resource} (currently #{current})")
    end
  end

  Result = Struct.new(:allowed, :limit, :current, :error, keyword_init: true) do
    def allowed?
      allowed == true
    end
  end

  class << self
    def check(owner, resource, current_count: 0)
      subscription = owner&.subscription
      return Result.new(allowed: false, limit: 0, current: current_count, error: :no_subscription) if subscription.nil?
      return Result.new(allowed: false, limit: 0, current: current_count, error: :subscription_inactive) unless subscription.active? || subscription.trialing?

      plan = subscription.plan
      return Result.new(allowed: false, limit: 0, current: current_count, error: :no_plan) if plan.nil? || !plan.active?

      limit = plan.limit_for(resource)
      if limit.nil?
        Result.new(allowed: true, limit: nil, current: current_count, error: nil)
      elsif current_count < limit.to_i
        Result.new(allowed: true, limit: limit.to_i, current: current_count, error: nil)
      else
        Result.new(allowed: false, limit: limit.to_i, current: current_count, error: :limit_exceeded)
      end
    end

    def enforce!(owner, resource, current_count: 0)
      result = check(owner, resource, current_count: current_count)
      return result if result.allowed?

      raise PlanLimitExceededError.new(resource: resource, limit: result.limit, current: current_count)
    end
  end
end
