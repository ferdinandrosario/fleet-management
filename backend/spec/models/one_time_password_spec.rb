require "rails_helper"

RSpec.describe OneTimePassword, type: :model do
  it { is_expected.to belong_to(:user) }

  it "expired? reflects expires_at" do
    expect(build(:one_time_password, expires_at: 1.minute.ago).expired?).to be(true)
    expect(build(:one_time_password, expires_at: 1.minute.from_now).expired?).to be(false)
  end

  it "consumed? reflects consumed_at" do
    expect(build(:one_time_password).consumed?).to be(false)
    expect(build(:one_time_password, consumed_at: Time.current).consumed?).to be(true)
  end

  it "locked? at MAX_ATTEMPTS" do
    expect(build(:one_time_password, attempts: 5).locked?).to be(true)
    expect(build(:one_time_password, attempts: 4).locked?).to be(false)
  end

  it ".active excludes consumed and expired codes" do
    active = create(:one_time_password)
    create(:one_time_password, consumed_at: Time.current)
    create(:one_time_password, expires_at: 1.minute.ago)
    expect(OneTimePassword.active).to contain_exactly(active)
  end
end
