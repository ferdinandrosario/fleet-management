require "rails_helper"

RSpec.describe OwnerPolicy do
  let(:super_admin) { create(:super_admin) }
  let(:owner) { create(:owner) }

  context "when authenticated as super admin" do
    before { Current.super_admin = super_admin }
    after { Current.super_admin = nil }

    let(:policy) { described_class.new(super_admin, owner) }

    it "permits all owner actions" do
      expect(policy.index?).to be true
      expect(policy.show?).to be true
      expect(policy.create?).to be true
      expect(policy.update?).to be true
      expect(policy.update_status?).to be true
    end
  end

  context "when not authenticated as super admin" do
    before { Current.super_admin = nil }

    let(:policy) { described_class.new(nil, owner) }

    it "forbids all owner actions" do
      expect(policy.index?).to be false
      expect(policy.show?).to be false
      expect(policy.create?).to be false
      expect(policy.update?).to be false
      expect(policy.update_status?).to be false
    end
  end
end
