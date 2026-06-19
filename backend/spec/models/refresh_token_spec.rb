require "rails_helper"

RSpec.describe RefreshToken, type: :model do
  it { is_expected.to belong_to(:user) }

  it "active? / revoked? reflect revoked_at and expiry" do
    expect(build(:refresh_token).active?).to be(true)
    expect(build(:refresh_token, revoked_at: Time.current).active?).to be(false)
    expect(build(:refresh_token, expires_at: 1.minute.ago).active?).to be(false)
    expect(build(:refresh_token, revoked_at: Time.current).revoked?).to be(true)
    expect(build(:refresh_token).revoked?).to be(false)
  end

  it ".active excludes revoked and expired tokens" do
    active = create(:refresh_token)
    create(:refresh_token, revoked_at: Time.current)
    create(:refresh_token, expires_at: 1.minute.ago)
    expect(RefreshToken.active).to contain_exactly(active)
  end
end
