# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Database Seeds" do
  after do
    if Owner.exists?(slug: "demo")
      Apartment::Tenant.drop("demo") rescue nil
    end
  end

  it "seeds plans, super admins, and demo tenant idempotently" do
    expect {
      Rails.application.load_seed
    }.not_to raise_error

    expect(Plan.where(tier: [ :basic, :pro, :enterprise ]).count).to eq(3)
    expect(SuperAdmin.exists?(email: "admin@example.com")).to be true

    super_admin = SuperAdmin.find_by(email: "admin@example.com")
    expect(super_admin.authenticate("adminsecret123")).to be_truthy

    expect(Owner.exists?(slug: "demo")).to be true

    Apartment::Tenant.switch("demo") do
      demo_user = User.find_by(phone: "+919876543210")
      expect(demo_user).to be_present
      expect(demo_user.phone_verified?).to be true
      expect(demo_user.authenticate("password123")).to be_truthy
    end

    # Test idempotency - running load_seed a second time should not fail or duplicate
    expect {
      Rails.application.load_seed
    }.not_to raise_error

    expect(Plan.where(tier: [ :basic, :pro, :enterprise ]).count).to eq(3)
  end
end
