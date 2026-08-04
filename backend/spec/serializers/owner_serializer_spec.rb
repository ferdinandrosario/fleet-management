require "rails_helper"

RSpec.describe OwnerSerializer do
  let(:owner) { create(:owner, name: "Rahul Sharma", company_name: "Apex Logistics Ltd", address: "123 MG Road") }

  describe ".call" do
    context "when caller is super admin" do
      it "includes company_name, name, and address" do
        serialized = described_class.call(owner, super_admin: true)

        expect(serialized[:id]).to eq(owner.uuid)
        expect(serialized[:name]).to eq("Rahul Sharma")
        expect(serialized[:company_name]).to eq("Apex Logistics Ltd")
        expect(serialized[:address]).to eq("123 MG Road")
        expect(serialized[:slug]).to eq(owner.slug)
      end
    end

    context "when caller is NOT super admin" do
      it "omits company_name but includes name and address" do
        serialized = described_class.call(owner, super_admin: false)

        expect(serialized[:id]).to eq(owner.uuid)
        expect(serialized[:name]).to eq("Rahul Sharma")
        expect(serialized.key?(:company_name)).to be false
        expect(serialized[:address]).to eq("123 MG Road")
        expect(serialized[:slug]).to eq(owner.slug)
      end
    end

    context "when owner is nil" do
      it "returns nil" do
        expect(described_class.call(nil)).to be_nil
      end
    end
  end
end
