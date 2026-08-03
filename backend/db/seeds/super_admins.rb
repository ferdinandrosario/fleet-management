# frozen_string_literal: true

module Seeds
  module SuperAdmins
    def self.seed!
      admin = SuperAdmin.find_or_initialize_by(email: "admin@fleet.example.com")
      admin.password = "adminsecret123"
      admin.password_confirmation = "adminsecret123"
      admin.save!
    end
  end
end
