require "rails_helper"

RSpec.describe TenantRegistry, type: :model do
  subject(:tenant_registry) { build(:tenant_registry) }

  it { is_expected.to be_valid }
  it { is_expected.to belong_to(:owner) }
  it { is_expected.to validate_uniqueness_of(:owner_id) }
  it { is_expected.to validate_presence_of(:slug) }
  it { is_expected.to validate_uniqueness_of(:slug).case_insensitive }
  it { is_expected.to validate_presence_of(:schema_name) }
  it { is_expected.to validate_uniqueness_of(:schema_name).case_insensitive }

  it { is_expected.to allow_value("acme_corp").for(:slug) }
  it { is_expected.not_to allow_value("1acme").for(:slug) }

  describe "normalization" do
    it "strips surrounding space and downcases slug and schema_name" do
      registry = create(:tenant_registry, slug: "  ACME  ", schema_name: "  ACME  ")
      expect(registry.slug).to eq("acme")
      expect(registry.schema_name).to eq("acme")
    end
  end
end
