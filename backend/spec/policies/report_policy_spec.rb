require "rails_helper"

RSpec.describe ReportPolicy, :tenant_schema do
  let(:slug) { "rpt_pol_#{SecureRandom.hex(4)}" }

  before do
    provision_tenant(slug)
    Apartment::Tenant.switch!(slug)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(slug)
  end

  subject(:policy) { described_class.new(user, :report) }

  let(:owner_admin) { create(:user, role: :owner_admin) }
  let(:customer) { create(:user, role: :customer) }

  context "when user is owner_admin" do
    let(:user) { owner_admin }

    it "allows dashboard and bookings_csv" do
      expect(policy.dashboard?).to be(true)
      expect(policy.bookings_csv?).to be(true)
    end
  end

  context "when user is customer" do
    let(:user) { customer }

    it "forbids dashboard and bookings_csv" do
      expect(policy.dashboard?).to be(false)
      expect(policy.bookings_csv?).to be(false)
    end
  end
end
