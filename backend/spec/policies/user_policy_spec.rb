require "rails_helper"

RSpec.describe UserPolicy do
  let(:user) { build_stubbed(:user) }
  let(:other) { build_stubbed(:user) }

  it "lets a user act on their own account" do
    policy = described_class.new(user, user)
    expect(policy.show?).to be(true)
    expect(policy.update?).to be(true)
    expect(policy.logout?).to be(true)
  end

  it "forbids acting on another user" do
    expect(described_class.new(user, other).show?).to be(false)
  end
end
