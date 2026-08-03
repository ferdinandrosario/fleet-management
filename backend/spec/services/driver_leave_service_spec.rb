require "rails_helper"

RSpec.describe DriverLeaveService do
  let(:driver) { create(:user, role: :driver) }
  let(:non_driver) { create(:user, role: :customer) }
  let(:owner_admin) { create(:user, role: :owner_admin) }

  describe ".apply_leave" do
    it "applies for leave when user has driver role" do
      res = described_class.apply_leave(
        driver: driver,
        start_date: Date.current,
        end_date: Date.current + 3.days,
        reason: "Personal work"
      )

      expect(res).to be_success
      expect(res.leave).to be_persisted
      expect(res.leave.status).to eq("pending")
    end

    it "returns error if driver is nil or non-driver" do
      nil_res = described_class.apply_leave(driver: nil, start_date: Date.current, end_date: Date.current + 1.day)
      expect(nil_res).not_to be_success

      role_res = described_class.apply_leave(driver: non_driver, start_date: Date.current, end_date: Date.current + 1.day)
      expect(role_res).not_to be_success
    end

    it "returns error if dates are invalid" do
      res = described_class.apply_leave(driver: driver, start_date: Date.current, end_date: Date.current - 1.day)
      expect(res).not_to be_success
    end
  end

  describe ".update_leave_status" do
    let(:leave) { create(:driver_leave, driver: driver) }

    it "approves leave application when updated by owner_admin" do
      res = described_class.update_leave_status(leave: leave, approver: owner_admin, status: :approved)

      expect(res).to be_success
      expect(leave.reload.status).to eq("approved")
      expect(leave.approved_by).to eq(owner_admin)
    end

    it "returns error if leave or approver is nil or non-owner_admin" do
      nil_res = described_class.update_leave_status(leave: nil, approver: owner_admin, status: :approved)
      expect(nil_res).not_to be_success

      role_res = described_class.update_leave_status(leave: leave, approver: driver, status: :approved)
      expect(role_res).not_to be_success
    end

    it "returns error for invalid status" do
      res = described_class.update_leave_status(leave: leave, approver: owner_admin, status: :invalid_status)
      expect(res).not_to be_success
    end

    it "returns error if leave model validation fails" do
      leave.start_date = nil
      res = described_class.update_leave_status(leave: leave, approver: owner_admin, status: :approved)

      expect(res).not_to be_success
      expect(res.errors[:start_date]).to be_present
    end
  end
end
