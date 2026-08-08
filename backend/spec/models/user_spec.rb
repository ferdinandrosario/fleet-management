require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  it { is_expected.to be_valid }
  it { is_expected.to have_secure_password }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to have_many(:one_time_passwords).dependent(:destroy) }
  it { is_expected.to have_many(:refresh_tokens).dependent(:destroy) }
  it { is_expected.to define_enum_for(:role).with_values(customer: 0, driver: 1, owner_admin: 2) }
  it { is_expected.to allow_value("+919876543210").for(:phone) }
  it { is_expected.not_to allow_value("not-a-phone").for(:phone) }
  it { is_expected.to validate_inclusion_of(:locale).in_array(%w[en]) }

  it "defaults role to customer" do
    expect(User.new.role).to eq("customer")
  end

  it "encrypts phone at rest but reads it back" do
    user = create(:user, phone: "+919999988888")
    expect(user.reload.phone).to eq("+919999988888")
    raw = User.connection.select_value("SELECT phone FROM users WHERE id = #{user.id}")
    expect(raw).not_to include("9999988888")
  end

  it "enforces phone uniqueness" do
    create(:user, phone: "+919876543210")
    expect(build(:user, phone: "+919876543210")).not_to be_valid
  end

  it "normalizes phone by stripping spaces" do
    expect(create(:user, phone: " +91 98765 43210 ").phone).to eq("+919876543210")
  end

  it "reports phone_verified? from the timestamp" do
    expect(build(:user).phone_verified?).to be(false)
    expect(build(:user, :verified).phone_verified?).to be(true)
  end

  describe "#formatted_phone" do
    it "returns blank phone directly" do
      user = build(:user)
      user.phone = nil
      expect(user.formatted_phone).to be_nil
    end

    it "formats 10-digit Indian phone with +91 prefix" do
      user = build(:user)
      user.phone = "9876543210"
      expect(user.formatted_phone).to eq("+919876543210")
    end

    it "returns already prefixed phone unchanged" do
      user = build(:user)
      user.phone = "+919876543210"
      expect(user.formatted_phone).to eq("+919876543210")
    end
  end
end
