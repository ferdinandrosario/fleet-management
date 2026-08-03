require "rails_helper"

RSpec.describe DriverPayroll, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      payroll = build(:driver_payroll)
      expect(payroll).to be_valid
    end

    it "requires period_start and period_end" do
      payroll = build(:driver_payroll, period_start: nil, period_end: nil)
      expect(payroll).not_to be_valid
    end

    it "validates period_end is on or after period_start" do
      payroll = build(:driver_payroll, period_start: Date.current, period_end: Date.current - 1.day)
      expect(payroll).not_to be_valid
      expect(payroll.errors[:period_end]).to include("must be after or equal to period start date")
    end
  end
end
