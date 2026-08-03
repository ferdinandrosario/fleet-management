require "rails_helper"

RSpec.describe Review, type: :model do
  describe "validations" do
    it "is valid with valid rating and attributes" do
      review = build(:review)
      expect(review).to be_valid
    end

    it "validates rating is between 1 and 5" do
      invalid_low = build(:review, rating: 0)
      invalid_high = build(:review, rating: 6)

      expect(invalid_low).not_to be_valid
      expect(invalid_high).not_to be_valid
    end

    it "validates booking_id uniqueness" do
      existing = create(:review)
      duplicate = build(:review, booking: existing.booking)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:booking_id]).to include("has already been taken")
    end
  end
end
