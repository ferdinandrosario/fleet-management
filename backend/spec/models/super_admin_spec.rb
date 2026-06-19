require "rails_helper"

RSpec.describe SuperAdmin, type: :model do
  subject(:super_admin) { build(:super_admin) }

  it { is_expected.to be_valid }
  it { is_expected.to have_secure_password }
  it { is_expected.to validate_presence_of(:email) }
  it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  it { is_expected.to allow_value("owner@fleet.test").for(:email) }
  it { is_expected.not_to allow_value("not-an-email").for(:email) }

  describe "external uuid" do
    it "is assigned on create" do
      expect(create(:super_admin).uuid).to be_present
    end

    it "is not overwritten when already set" do
      preset = "11111111-1111-1111-1111-111111111111"
      admin = build(:super_admin, uuid: preset)
      admin.valid?
      expect(admin.uuid).to eq(preset)
    end
  end

  describe "email normalization" do
    it "strips surrounding space and downcases" do
      admin = create(:super_admin, email: "  Owner@Fleet.TEST  ")
      expect(admin.email).to eq("owner@fleet.test")
    end
  end
end
