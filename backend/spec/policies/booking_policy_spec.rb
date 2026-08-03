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

  context "when user is assigned driver of booking" do
    let(:driver) { create(:user, role: :driver) }
    let(:user) { driver }
    let(:booking) { create(:booking, customer: customer, driver: driver) }

    it "allows show, start_job, finish_job, record_gps, and view_tracking" do
      expect(policy.show?).to be(true)
      expect(policy.start_job?).to be(true)
      expect(policy.finish_job?).to be(true)
      expect(policy.record_gps?).to be(true)
      expect(policy.view_tracking?).to be(true)
      expect(policy.assign_driver?).to be(false)
    end
  end

  context "when user is an unrelated customer" do
    let(:user) { other_user }

    it "allows create and index but forbids show, pay_advance, cancel, and driver actions" do
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.show?).to be(false)
      expect(policy.pay_advance?).to be(false)
      expect(policy.cancel?).to be(false)
      expect(policy.start_job?).to be(false)
      expect(policy.finish_job?).to be(false)
      expect(policy.record_gps?).to be(false)
    end
  end
end
