require "rails_helper"

RSpec.describe DriverLeavePolicy, :tenant_schema do
  let(:slug) { "leave_pol_#{SecureRandom.hex(4)}" }

  before do
    provision_tenant(slug)
    Apartment::Tenant.switch!(slug)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(slug)
  end

  subject(:policy) { described_class.new(user, leave) }

  let(:driver) { create(:user, role: :driver) }
  let(:owner_admin) { create(:user, role: :owner_admin) }
  let(:customer) { create(:user, role: :customer) }
  let(:leave) { create(:driver_leave, driver: driver) }

  context "when user is driver" do
    let(:user) { driver }

    it "allows index and create but forbids update_status" do
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update_status?).to be(false)
    end
  end

  context "when user is owner_admin" do
    let(:user) { owner_admin }

    it "allows index and update_status but forbids create" do
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(false)
      expect(policy.update_status?).to be(true)
    end
  end

  context "when user is customer" do
    let(:user) { customer }

    it "forbids index, create, and update_status" do
      expect(policy.index?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update_status?).to be(false)
    end
  end
end
