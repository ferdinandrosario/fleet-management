require "rails_helper"

RSpec.describe JobExecutionService do
  let(:driver) { create(:user, role: :driver) }
  let(:non_driver) { create(:user, role: :customer) }
  let(:booking) { create(:booking, status: :confirmed, payment_status: :advance_paid) }

  describe ".assign_driver" do
    it "assigns driver to booking" do
      res = described_class.assign_driver(booking: booking, driver: driver)

      expect(res).to be_success
      expect(booking.reload.driver).to eq(driver)
    end

    it "returns error for non-driver role" do
      res = described_class.assign_driver(booking: booking, driver: non_driver)

      expect(res).not_to be_success
      expect(res.errors[:driver]).to include("must have driver role")
    end

    it "returns error when booking is nil or closed" do
      nil_res = described_class.assign_driver(booking: nil, driver: driver)
      expect(nil_res).not_to be_success

      booking.completed!
      closed_res = described_class.assign_driver(booking: booking, driver: driver)
      expect(closed_res).not_to be_success
    end
  end

  describe ".start_job" do
    before { booking.update!(driver: driver) }

    it "starts job execution with initial meter reading" do
      res = described_class.start_job(booking: booking, driver: driver, start_meter_reading: 1250.5)

      expect(res).to be_success
      expect(booking.reload.status).to eq("in_progress")
      expect(booking.start_meter_reading).to eq(1250.5)
      expect(booking.job_started_at).to be_present
    end

    it "returns error if booking is nil or not confirmed" do
      nil_res = described_class.start_job(booking: nil, driver: driver, start_meter_reading: 100)
      expect(nil_res).not_to be_success

      booking.update!(status: :pending_payment)
      unconfirmed_res = described_class.start_job(booking: booking, driver: driver, start_meter_reading: 100)
      expect(unconfirmed_res).not_to be_success
    end

    it "returns error if driver is not assigned" do
      other_driver = create(:user, role: :driver)
      res = described_class.start_job(booking: booking, driver: other_driver, start_meter_reading: 100)

      expect(res).not_to be_success
      expect(res.errors[:driver]).to include("is not assigned to this booking")
    end

    it "returns error for invalid meter reading" do
      res = described_class.start_job(booking: booking, driver: driver, start_meter_reading: -10)

      expect(res).not_to be_success
      expect(res.errors[:start_meter_reading]).to include("must be greater than or equal to 0")
    end
  end

  describe ".finish_job" do
    before { booking.update!(driver: driver, status: :in_progress, start_meter_reading: 1000.0, job_started_at: 2.hours.ago) }

    it "completes job execution with final meter reading" do
      res = described_class.finish_job(booking: booking, driver: driver, end_meter_reading: 1045.0)

      expect(res).to be_success
      expect(booking.reload.status).to eq("completed")
      expect(booking.end_meter_reading).to eq(1045.0)
      expect(booking.job_finished_at).to be_present
    end

    it "returns error if booking is nil or not in_progress" do
      nil_res = described_class.finish_job(booking: nil, driver: driver, end_meter_reading: 1050)
      expect(nil_res).not_to be_success

      booking.update!(status: :confirmed)
      not_in_progress_res = described_class.finish_job(booking: booking, driver: driver, end_meter_reading: 1050)
      expect(not_in_progress_res).not_to be_success
    end

    it "returns error if driver is not assigned" do
      other_driver = create(:user, role: :driver)
      res = described_class.finish_job(booking: booking, driver: other_driver, end_meter_reading: 1050)

      expect(res).not_to be_success
      expect(res.errors[:driver]).to include("is not assigned to this booking")
    end

    it "returns error if end_meter_reading is less than start_meter_reading" do
      res = described_class.finish_job(booking: booking, driver: driver, end_meter_reading: 990.0)

      expect(res).not_to be_success
      expect(res.errors[:end_meter_reading].first).to include("must be greater than or equal to start meter reading")
    end
  end
end
