require "rails_helper"

RSpec.describe SuperAdminDashboardPolicy do
  subject(:policy) { described_class.new(user, :super_admin_dashboard) }

  let(:super_admin) { create(:super_admin) }
  let(:customer) { create(:user, role: :customer) }

  context "when user is SuperAdmin" do
    let(:user) { super_admin }

    it "allows show" do
      expect(policy.show?).to be(true)
    end
  end

  context "when user is regular user" do
    let(:user) { customer }

    it "forbids show" do
      expect(policy.show?).to be(false)
    end
  end
end
