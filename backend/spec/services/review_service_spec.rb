require "rails_helper"

RSpec.describe ReviewService do
  let(:customer) { create(:user, role: :customer) }
  let(:vehicle) { create(:vehicle) }
  let(:booking) { create(:booking, customer: customer, vehicle: vehicle, status: :completed) }

  describe ".create_review" do
    it "creates review and updates vehicle rating statistics" do
      res = described_class.create_review(
        booking: booking,
        customer: customer,
        rating: 5,
        comment: "Great work!",
        completion_photo_url: "https://cdn.example.com/proof.jpg"
      )

      expect(res).to be_success
      expect(res.review).to be_persisted
      expect(vehicle.reload.reviews_count).to eq(1)
      expect(vehicle.average_rating).to eq(5.0)
    end

    it "returns error if booking or customer is nil" do
      nil_res = described_class.create_review(booking: nil, customer: customer, rating: 5)
      expect(nil_res).not_to be_success
    end

    it "returns error if booking is not completed" do
      booking.in_progress!
      res = described_class.create_review(booking: booking, customer: customer, rating: 5)

      expect(res).not_to be_success
      expect(res.errors[:booking]).to include("must be completed to submit a review")
    end

    it "returns error if customer is not the booking owner" do
      other_customer = create(:user, role: :customer)
      res = described_class.create_review(booking: booking, customer: other_customer, rating: 5)

      expect(res).not_to be_success
      expect(res.errors[:customer]).to include("is not the owner of this booking")
    end

    it "returns error if booking has already been reviewed" do
      create(:review, booking: booking, vehicle: vehicle, customer: customer)
      res = described_class.create_review(booking: booking, customer: customer, rating: 4)

      expect(res).not_to be_success
      expect(res.errors[:booking]).to include("has already been reviewed")
    end

    it "returns errors hash if review model validation fails" do
      res = described_class.create_review(booking: booking, customer: customer, rating: 10)

      expect(res).not_to be_success
      expect(res.errors[:rating]).to be_present
    end
  end
end
