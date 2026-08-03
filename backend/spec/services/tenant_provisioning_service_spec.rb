require "rails_helper"

RSpec.describe TenantProvisioningService do
  let!(:plan) { create(:plan) }

  describe ".call" do
    context "with valid parameters" do
      it "provisions owner, tenant registry, subscription, schema, and owner_admin user" do
        slug = "test_tenant_#{SecureRandom.hex(4)}"

        result = described_class.call(
          name: "Test Transit",
          slug: slug,
          plan: plan,
          owner_name: "Owner Admin",
          owner_phone: "+919876543210",
          password: "SecurePassword123!"
        )

        expect(result).to be_success
        expect(result.owner).to be_persisted
        expect(result.owner.slug).to eq(slug)
        expect(result.tenant_registry.schema_name).to eq(slug)
        expect(result.subscription.plan).to eq(plan)

        Apartment::Tenant.switch(slug) do
          user = User.find_by(phone: "+919876543210")
          expect(user).to be_present
          expect(user.role).to eq("owner_admin")
        end

        # Cleanup tenant schema after test
        Apartment::Tenant.drop(slug) rescue nil
      end
    end

    context "with invalid parameters" do
      it "returns errors if owner parameters are invalid" do
        result = described_class.call(
          name: "",
          slug: "invalid-slug!",
          plan: plan,
          owner_name: "Owner",
          owner_phone: "+919876543210",
          password: "pass"
        )

        expect(result).not_to be_success
        expect(result.errors[:slug]).to be_present
      end

      it "returns error if slug is already taken" do
        existing_owner = create(:owner, slug: "taken_slug")
        create(:tenant_registry, owner: existing_owner, slug: "taken_slug")

        result = described_class.call(
          name: "Duplicate Tenant",
          slug: "taken_slug",
          plan: plan,
          owner_name: "Owner",
          owner_phone: "+919876543210",
          password: "password"
        )

        expect(result).not_to be_success
        expect(result.errors[:slug]).to be_present
      end

      it "cleans up database records on tenant setup failure" do
        allow(Apartment::Tenant).to receive(:switch).and_raise(StandardError.new("Switch failure"))

        slug = "failed_tenant_#{SecureRandom.hex(4)}"
        result = described_class.call(
          name: "Failed Tenant",
          slug: slug,
          plan: plan,
          owner_name: "Owner",
          owner_phone: "+919876543210",
          password: "Password123!"
        )

        expect(result).not_to be_success
        expect(Owner.find_by(slug: slug)).to be_nil
        expect(TenantRegistry.find_by(slug: slug)).to be_nil
      end
    end
  end
end
