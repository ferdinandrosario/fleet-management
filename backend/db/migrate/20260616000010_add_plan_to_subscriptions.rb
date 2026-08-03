# Link each subscription to its plan (nullable: a subscription can be created
# before a plan is chosen, e.g. during onboarding). Restrict deletion of a plan
# that still has subscriptions.
class AddPlanToSubscriptions < ActiveRecord::Migration[8.1]
  def change
    add_reference :subscriptions, :plan, foreign_key: true, index: true
  end
end
