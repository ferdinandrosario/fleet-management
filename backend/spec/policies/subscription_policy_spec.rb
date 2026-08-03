require "rails_helper"

RSpec.describe SubscriptionPolicy do
  let(:super_admin) { create(:super_admin) }
  let(:subscription) { create(:subscription) }

  context "when authenticated as super admin" do
    before { Current.super_admin = super_admin }
    after { Current.super_admin = nil }

    let(:policy) { described_class.new(super_admin, subscription) }

    it "permits subscription actions" do
      expect(policy.show?).to be true
      expect(policy.update?).to be true
    end
  end

  context "when not authenticated as super admin" do
    before { Current.super_admin = nil }

    let(:policy) { described_class.new(nil, subscription) }

    it "forbids subscription actions" do
      expect(policy.show?).to be false
      expect(policy.update?).to be false
    end
  end
end
