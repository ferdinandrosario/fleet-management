require "rails_helper"

RSpec.describe Plan, type: :model do
  subject(:plan) { build(:plan) }

  describe "associations" do
    it { is_expected.to have_many(:subscriptions).dependent(:restrict_with_exception) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
    it { is_expected.to validate_numericality_of(:price_paise).only_integer.is_greater_than_or_equal_to(0) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:tier).with_values(basic: 0, pro: 1, enterprise: 2) }
    it { is_expected.to define_enum_for(:interval).with_values(monthly: 0, yearly: 1) }
  end

  describe "#limit_for" do
    it "returns the limit string for a resource when present" do
      plan.limits = { "vehicles" => 10 }
      expect(plan.limit_for(:vehicles)).to eq(10)
    end

    it "returns nil when resource limit is not set" do
      plan.limits = {}
      expect(plan.limit_for(:vehicles)).to be_nil
    end
  end
end
