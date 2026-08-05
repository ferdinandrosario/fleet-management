require 'rails_helper'

RSpec.describe VehicleModelPolicy, type: :policy do
  let(:super_admin) { create(:super_admin) }
  let(:owner) { create(:user, role: :owner_admin) }
  let(:vehicle_model) { create(:vehicle_model) }

  context "when user is a super admin" do
    before { Current.super_admin = super_admin }
    after { Current.super_admin = nil }

    it "grants access to all actions" do
      expect(described_class.new(nil, vehicle_model).index?).to be true
      expect(described_class.new(nil, vehicle_model).show?).to be true
      expect(described_class.new(nil, vehicle_model).create?).to be true
      expect(described_class.new(nil, vehicle_model).update?).to be true
      expect(described_class.new(nil, vehicle_model).destroy?).to be true
    end
  end

  context "when user is an owner" do
    before { Current.user = owner }
    after { Current.user = nil }

    it "denies access to all actions" do
      expect(described_class.new(owner, vehicle_model).index?).to be false
      expect(described_class.new(owner, vehicle_model).show?).to be false
      expect(described_class.new(owner, vehicle_model).create?).to be false
      expect(described_class.new(owner, vehicle_model).update?).to be false
      expect(described_class.new(owner, vehicle_model).destroy?).to be false
    end
  end
end
