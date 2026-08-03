require "rails_helper"

RSpec.describe DriverLeave, type: :model do
  describe "validations" do
    it "is valid with valid dates and driver" do
      leave = build(:driver_leave)
      expect(leave).to be_valid
    end

    it "requires start_date and end_date" do
      leave = build(:driver_leave, start_date: nil, end_date: nil)
      expect(leave).not_to be_valid
    end

    it "validates end_date is on or after start_date" do
      leave = build(:driver_leave, start_date: Date.current, end_date: Date.current - 1.day)
      expect(leave).not_to be_valid
      expect(leave.errors[:end_date]).to include("must be after or equal to start date")
    end
  end
end
