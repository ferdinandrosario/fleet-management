require "rails_helper"

RSpec.describe VehiclePolicy, :tenant_schema do
  let(:tenant) { "test_tenant_policy" }

  before do
    provision_tenant(tenant)
    Apartment::Tenant.switch!(tenant)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(tenant)
  end

  subject(:policy) { described_class.new(user, vehicle) }

  let(:vehicle) { create(:vehicle) }

  context "when user is owner_admin" do
    let(:user) { create(:user, role: :owner_admin) }

    it "allows all vehicle operations" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
      expect(policy.calculate_quote?).to be(true)
    end
  end

  context "when user is customer" do
    let(:user) { create(:user, role: :customer) }

    it "allows index, show, and calculate_quote but forbids mutation" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.calculate_quote?).to be(true)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end
  end
end
