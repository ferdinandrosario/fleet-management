require "rails_helper"

RSpec.describe VehicleAvailability, :tenant_schema, type: :model do
  let(:tenant) { "test_tenant_avail" }

  before do
    provision_tenant(tenant)
    Apartment::Tenant.switch!(tenant)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(tenant)
  end

  subject(:availability) { build(:vehicle_availability) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:start_time) }
    it { is_expected.to validate_presence_of(:end_time) }

    it "validates end_time is after start_time" do
      availability.start_time = 2.days.from_now
      availability.end_time = 1.day.from_now
      expect(availability).not_to be_valid
      expect(availability.errors[:end_time]).to include("must be after start time")
    end
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:reason).with_values(maintenance: 0, booked: 1, owner_hold: 2) }
  end
end
