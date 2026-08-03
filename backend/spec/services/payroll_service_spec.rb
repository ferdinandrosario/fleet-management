require "rails_helper"

RSpec.describe PayrollService do
  let(:driver) { create(:user, role: :driver) }
  let(:non_driver) { create(:user, role: :customer) }

  describe ".calculate_payroll" do
    it "calculates completed job earnings, hours, and payout" do
      create(
        :booking,
        driver: driver,
        status: :completed,
        total_cents: 100000,
        job_started_at: 2.hours.ago,
        job_finished_at: 1.hour.ago
      )

      res = described_class.calculate_payroll(
        driver: driver,
        period_start: 1.day.ago.to_date,
        period_end: Date.current,
        bonus_cents: 5000,
        deductions_cents: 1000
      )

      expect(res).to be_success
      expect(res.payroll.completed_jobs_count).to eq(1)
      expect(res.payroll.total_hours_worked.to_f).to eq(1.0)
      expect(res.payroll.base_pay_cents).to eq(40000)
      expect(res.payroll.total_payout_cents).to eq(44000)
    end

    it "returns error if driver is nil or non-driver" do
      nil_res = described_class.calculate_payroll(driver: nil, period_start: Date.current, period_end: Date.current)
      expect(nil_res).not_to be_success

      role_res = described_class.calculate_payroll(driver: non_driver, period_start: Date.current, period_end: Date.current)
      expect(role_res).not_to be_success
    end

    it "returns error if dates are blank or invalid" do
      res = described_class.calculate_payroll(driver: driver, period_start: nil, period_end: nil)
      expect(res).not_to be_success
    end
  end

  describe ".mark_as_paid" do
    let(:payroll) { create(:driver_payroll, driver: driver, status: :draft) }

    it "updates payroll status to paid" do
      res = described_class.mark_as_paid(payroll: payroll)

      expect(res).to be_success
      expect(payroll.reload.status).to eq("paid")
    end

    it "returns error if payroll is nil" do
      res = described_class.mark_as_paid(payroll: nil)
      expect(res).not_to be_success
    end

    it "returns error if payroll update fails" do
      payroll.period_end = payroll.period_start - 1.day
      res = described_class.mark_as_paid(payroll: payroll)

      expect(res).not_to be_success
      expect(res.errors[:period_end]).to be_present
    end
  end
end
