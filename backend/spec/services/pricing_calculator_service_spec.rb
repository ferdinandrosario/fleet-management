require "rails_helper"

RSpec.describe PricingCalculatorService, :tenant_schema do
  let(:tenant) { "test_tenant_calc" }

  before do
    provision_tenant(tenant)
    Apartment::Tenant.switch!(tenant)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(tenant)
  end

  let(:vehicle) { create(:vehicle, hourly_rate_cents: 50000, daily_rate_cents: 350000) }

  describe ".call" do
    it "returns zero quote for zero hours and days" do
      result = described_class.call(vehicle: vehicle, hours: 0, days: 0)

      expect(result.base_cents).to eq(0)
      expect(result.final_cents).to eq(0)
      expect(result.applied_rule).to be_nil
    end

    it "calculates standard hourly quote without rules" do
      result = described_class.call(vehicle: vehicle, hours: 5, days: 0)

      expect(result.base_cents).to eq(250000) # 5 * 50000
      expect(result.discount_cents).to eq(0)
      expect(result.final_cents).to eq(250000)
    end

    it "calculates daily quote with mix of days and hours" do
      result = described_class.call(vehicle: vehicle, hours: 2, days: 1)

      expect(result.base_cents).to eq(350000 + (2 * 50000)) # 450000
      expect(result.final_cents).to eq(450000)
    end

    it "applies discount percentage rule when min_duration_hours is met" do
      rule = create(:pricing_rule, vehicle: vehicle, min_duration_hours: 10, discount_percentage: 20.0)

      result = described_class.call(vehicle: vehicle, hours: 12, days: 0)

      expect(result.base_cents).to eq(600000) # 12 * 50000
      expect(result.discount_cents).to eq(120000) # 20% of 600000
      expect(result.final_cents).to eq(480000)
      expect(result.applied_rule).to eq(rule)
    end

    it "applies rate override rule when present" do
      rule = create(:pricing_rule, vehicle: vehicle, min_duration_hours: 24, override_daily_rate_cents: 300000, discount_percentage: 0)

      result = described_class.call(vehicle: vehicle, hours: 0, days: 2)

      expect(result.base_cents).to eq(600000) # 2 * 300000
      expect(result.final_cents).to eq(600000)
      expect(result.applied_rule).to eq(rule)
    end
  end
end
