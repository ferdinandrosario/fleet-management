# frozen_string_literal: true

Dir[Rails.root.join("db/seeds/*.rb")].each { |file| require file }

ActiveRecord::Base.transaction do
  Seeds::Plans.seed!
  Seeds::SuperAdmins.seed!
  Seeds::VehicleModels.seed!
  Seeds::DemoTenant.seed!
end
