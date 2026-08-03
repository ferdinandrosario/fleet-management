require "rails_helper"

RSpec.describe PricingRule, :tenant_schema, type: :model do
  let(:tenant) { "test_tenant_price" }

  before do
    provision_tenant(tenant)
    Apartment::Tenant.switch!(tenant)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(tenant)
  end

  subject(:rule) { build(:pricing_rule) }

  describe "validations" do
    it { is_expected.to validate_numericality_of(:min_duration_hours).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:discount_percentage).is_greater_than_or_equal_to(0).is_less_than_or_equal_to(100) }
  end

  describe "scopes" do
    it "filters active rules" do
      r1 = create(:pricing_rule, active: true)
      create(:pricing_rule, active: false)

      expect(described_class.active).to contain_exactly(r1)
    end
  end
end
