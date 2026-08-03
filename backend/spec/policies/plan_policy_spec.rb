require "rails_helper"

RSpec.describe PlanPolicy do
  let(:super_admin) { create(:super_admin) }
  let(:plan) { create(:plan) }

  context "when authenticated as super admin" do
    before { Current.super_admin = super_admin }
    after { Current.super_admin = nil }

    let(:policy) { described_class.new(super_admin, plan) }

    it "permits all plan actions" do
      expect(policy.index?).to be true
      expect(policy.show?).to be true
      expect(policy.create?).to be true
      expect(policy.update?).to be true
    end
  end

  context "when not authenticated as super admin" do
    before { Current.super_admin = nil }

    let(:policy) { described_class.new(nil, plan) }

    it "forbids all plan actions" do
      expect(policy.index?).to be false
      expect(policy.show?).to be false
      expect(policy.create?).to be false
      expect(policy.update?).to be false
    end
  end
end
