require "rails_helper"

RSpec.describe Vehicle, :tenant_schema, type: :model do
  let(:tenant) { "test_tenant_veh" }

  before do
    provision_tenant(tenant)
    Apartment::Tenant.switch!(tenant)
  end

  after do
    Apartment::Tenant.reset
    drop_tenant(tenant)
  end

  subject(:vehicle) { build(:vehicle) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:registration_number) }
    it { is_expected.to validate_numericality_of(:hourly_rate_paise).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:daily_rate_paise).is_greater_than_or_equal_to(0) }

    it "validates registration number uniqueness" do
      create(:vehicle, registration_number: "TN-01-AA-1234")
      duplicate = build(:vehicle, registration_number: "tn-01-aa-1234")
      expect(duplicate).not_to be_valid
    end

    it "validates model_year bounds" do
      vehicle.model_year = 1899
      expect(vehicle).not_to be_valid

      vehicle.model_year = Time.current.year + 5
      expect(vehicle).not_to be_valid

      vehicle.model_year = 2022
      expect(vehicle).to be_valid
    end
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:category).with_values(tractor: 0, jcb: 1, heavy_vehicle: 2, bus: 3, crane: 4, harvester: 5) }
    it { is_expected.to define_enum_for(:status).with_values(available: 0, booked: 1, maintenance: 2, inactive: 3) }
  end

  describe "scopes" do
    it "filters available_only and by_category" do
      v1 = create(:vehicle, category: :tractor, status: :available)
      create(:vehicle, category: :jcb, status: :maintenance)

      expect(described_class.available_only).to contain_exactly(v1)
      expect(described_class.by_category(:tractor)).to contain_exactly(v1)
    end
  end
end
