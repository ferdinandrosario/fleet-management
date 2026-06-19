require "rails_helper"

RSpec.describe ApplicationPolicy do
  subject(:policy) { described_class.new(double("user"), double("record")) }

  it "denies every action by default (default-deny)" do
    expect(policy.index?).to be(false)
    expect(policy.show?).to be(false)
    expect(policy.create?).to be(false)
    expect(policy.update?).to be(false)
    expect(policy.destroy?).to be(false)
  end

  it "requires subclasses to implement Scope#resolve" do
    scope = described_class::Scope.new(double("user"), double("scope"))
    expect { scope.resolve }.to raise_error(NoMethodError)
  end
end
