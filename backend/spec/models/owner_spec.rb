require "rails_helper"

RSpec.describe Owner, type: :model do
  subject(:owner) { build(:owner) }

  it { is_expected.to be_valid }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:slug) }
  it { is_expected.to validate_uniqueness_of(:slug).case_insensitive }
  it { is_expected.to have_one(:subscription).dependent(:destroy) }
  it { is_expected.to have_one(:tenant_registry).dependent(:destroy) }

  it {
    is_expected.to define_enum_for(:status)
      .with_values(pending: 0, active: 1, suspended: 2, cancelled: 3)
  }

  it { is_expected.to allow_value("acme_corp1").for(:slug) }
  it { is_expected.not_to allow_value("1acme").for(:slug) }   # must start with a letter
  it { is_expected.not_to allow_value("ac-me").for(:slug) }   # no hyphens

  it "defaults status to pending" do
    expect(Owner.new.status).to eq("pending")
  end

  describe "slug normalization" do
    it "strips surrounding space and downcases" do
      expect(create(:owner, slug: "  ACME_Corp  ").slug).to eq("acme_corp")
    end
  end
end
