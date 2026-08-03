require "rails_helper"

RSpec.describe DriverPayrollPolicy, :tenant_schema do
  let(:slug) { "pay_pol_#{SecureRandom.hex(4)}" }

  before do
    provision_tenant(slug)
    Apartment::Tenant.switch!(slug)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(slug)
  end

  subject(:policy) { described_class.new(user, payroll) }

  let(:driver) { create(:user, role: :driver) }
  let(:owner_admin) { create(:user, role: :owner_admin) }
  let(:customer) { create(:user, role: :customer) }
  let(:payroll) { create(:driver_payroll, driver: driver) }

  context "when user is driver" do
    let(:user) { driver }

    it "allows index but forbids calculate and pay" do
      expect(policy.index?).to be(true)
      expect(policy.calculate?).to be(false)
      expect(policy.pay?).to be(false)
    end
  end

  context "when user is owner_admin" do
    let(:user) { owner_admin }

    it "allows index, calculate, and pay" do
      expect(policy.index?).to be(true)
      expect(policy.calculate?).to be(true)
      expect(policy.pay?).to be(true)
    end
  end

  context "when user is customer" do
    let(:user) { customer }

    it "forbids index, calculate, and pay" do
      expect(policy.index?).to be(false)
      expect(policy.calculate?).to be(false)
      expect(policy.pay?).to be(false)
    end
  end
end
