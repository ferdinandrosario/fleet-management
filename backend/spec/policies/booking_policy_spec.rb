require "rails_helper"

RSpec.describe BookingPolicy, :tenant_schema do
  let(:slug) { "policy_booking_#{SecureRandom.hex(4)}" }

  before do
    provision_tenant(slug)
    Apartment::Tenant.switch!(slug)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(slug)
  end

  subject(:policy) { described_class.new(user, booking) }

  let(:customer) { create(:user, role: :customer) }
  let(:other_user) { create(:user, role: :customer) }
  let(:owner_admin) { create(:user, role: :owner_admin) }
  let(:booking) { create(:booking, customer: customer) }

  context "when user is customer owner of booking" do
    let(:user) { customer }

    it "allows booking actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.pay_advance?).to be(true)
      expect(policy.cancel?).to be(true)
    end
  end

  context "when user is owner admin" do
    let(:user) { owner_admin }

    it "allows booking actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.pay_advance?).to be(true)
      expect(policy.cancel?).to be(true)
    end
  end

  context "when user is an unrelated customer" do
    let(:user) { other_user }

    it "allows create and index but forbids show, pay_advance, and cancel" do
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.show?).to be(false)
      expect(policy.pay_advance?).to be(false)
      expect(policy.cancel?).to be(false)
    end
  end
end
