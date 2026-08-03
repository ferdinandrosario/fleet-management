require "rails_helper"

RSpec.describe PlanLimitService do
  let(:plan) { create(:plan, limits: { "vehicles" => 2 }) }
  let(:owner) { create(:owner) }
  let!(:subscription) { create(:subscription, owner: owner, plan: plan, status: :active) }

  describe ".check" do
    it "returns allowed when under the limit" do
      result = described_class.check(owner, :vehicles, current_count: 1)
      expect(result).to be_allowed
      expect(result.limit).to eq(2)
      expect(result.current).to eq(1)
      expect(result.error).to be_nil
    end

    it "returns limit_exceeded error when count meets or exceeds limit" do
      result = described_class.check(owner, :vehicles, current_count: 2)
      expect(result).not_to be_allowed
      expect(result.error).to eq(:limit_exceeded)
    end

    it "returns allowed when limit is nil (unlimited)" do
      unlimited_plan = create(:plan, limits: { "vehicles" => nil })
      owner_unlimited = create(:owner)
      create(:subscription, owner: owner_unlimited, plan: unlimited_plan, status: :active)

      result = described_class.check(owner_unlimited, :vehicles, current_count: 999)
      expect(result).to be_allowed
      expect(result.limit).to be_nil
    end

    it "returns no_subscription error when owner has no subscription" do
      owner_no_sub = create(:owner)
      result = described_class.check(owner_no_sub, :vehicles, current_count: 0)
      expect(result).not_to be_allowed
      expect(result.error).to eq(:no_subscription)
    end

    it "returns subscription_inactive error when subscription is canceled" do
      subscription.update!(status: :canceled)
      result = described_class.check(owner, :vehicles, current_count: 0)
      expect(result).not_to be_allowed
      expect(result.error).to eq(:subscription_inactive)
    end

    it "returns no_plan error if plan is inactive" do
      plan.update!(active: false)
      result = described_class.check(owner, :vehicles, current_count: 0)
      expect(result).not_to be_allowed
      expect(result.error).to eq(:no_plan)
    end
  end

  describe ".enforce!" do
    it "does not raise when under limit" do
      expect { described_class.enforce!(owner, :vehicles, current_count: 1) }.not_to raise_error
    end

    it "raises PlanLimitExceededError when limit exceeded" do
      expect {
        described_class.enforce!(owner, :vehicles, current_count: 2)
      }.to raise_error(PlanLimitService::PlanLimitExceededError)
    end
  end
end
