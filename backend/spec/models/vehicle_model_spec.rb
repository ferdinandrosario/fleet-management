require 'rails_helper'

RSpec.describe VehicleModel, type: :model do
  describe "validations" do
    subject { build(:vehicle_model) }
    
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:make) }
    it { should validate_uniqueness_of(:name).scoped_to(:make).case_insensitive }
  end

  describe "enums" do
    it { should define_enum_for(:category).with_values(tractor: 0, jcb: 1, heavy_vehicle: 2, bus: 3, crane: 4, harvester: 5) }
  end

  describe "associations" do
    it { should have_many(:vehicles).dependent(:nullify) }
  end
end
