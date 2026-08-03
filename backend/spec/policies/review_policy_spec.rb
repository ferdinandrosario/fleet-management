require "rails_helper"

RSpec.describe ReviewPolicy, :tenant_schema do
  let(:slug) { "policy_rev_#{SecureRandom.hex(4)}" }

  before do
    provision_tenant(slug)
    Apartment::Tenant.switch!(slug)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(slug)
  end

  subject(:policy) { described_class.new(user, review) }

  let(:customer) { create(:user, role: :customer) }
  let(:other_user) { create(:user, role: :customer) }
  let(:review) { create(:review, customer: customer) }

  context "when user is customer who wrote review" do
    let(:user) { customer }

    it "allows create and index" do
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(true)
    end
  end

  context "when user is an unrelated user" do
    let(:user) { other_user }

    it "allows index but forbids create" do
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(false)
    end
  end
end
