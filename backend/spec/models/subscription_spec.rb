require "rails_helper"

RSpec.describe Subscription, type: :model do
  subject(:subscription) { build(:subscription) }

  it { is_expected.to be_valid }
  it { is_expected.to belong_to(:owner) }
  it { is_expected.to validate_uniqueness_of(:owner_id) }
  it { is_expected.to validate_uniqueness_of(:razorpay_subscription_id).allow_nil }

  it {
    is_expected.to define_enum_for(:status)
      .with_values(incomplete: 0, trialing: 1, active: 2, past_due: 3, canceled: 4)
  }

  it "defaults status to incomplete" do
    expect(Subscription.new.status).to eq("incomplete")
  end

  it "assigns an external uuid on create" do
    expect(create(:subscription).uuid).to be_present
  end

  it "allows multiple subscriptions with a null razorpay id" do
    create(:subscription, razorpay_subscription_id: nil)
    expect(build(:subscription, razorpay_subscription_id: nil)).to be_valid
  end
end
