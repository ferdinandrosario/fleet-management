# frozen_string_literal: true

module Seeds
  module DemoTenant
    def self.seed!
      pro_plan = Plan.find_by!(tier: :pro)
      owner = Owner.find_by(slug: "demo")

      unless owner
        result = TenantProvisioningService.call(
          name: "demo",
          company_name: "Demo Fleet Logistics Pvt Ltd",
          address: "100 Anna Salai, Guindy, Chennai",
          slug: "demo",
          plan: pro_plan,
          owner_name: "John Doe",
          owner_phone: "+919876543210",
          password: "password123",
          status: :active
        )
        raise "Failed to provision demo tenant: #{result.errors.inspect}" unless result.success?

        owner = result.owner
      end

      Apartment::Tenant.switch("demo") do
        owner_user = User.find_or_initialize_by(phone: "+919876543210")
        owner_user.name = "John Doe"
        owner_user.password = "password123"
        owner_user.role = :owner_admin
        owner_user.phone_verified_at = Time.current
        owner_user.save!

        driver_user = User.find_or_initialize_by(phone: "+919876543211")
        driver_user.name = "Peter Parker"
        driver_user.password = "password123"
        driver_user.role = :driver
        driver_user.phone_verified_at = Time.current
        driver_user.save!

        customer_user = User.find_or_initialize_by(phone: "+919876543212")
        customer_user.name = "David Smith"
        customer_user.password = "password123"
        customer_user.role = :customer
        customer_user.phone_verified_at = Time.current
        customer_user.save!

        v1 = Vehicle.find_or_initialize_by(registration_number: "TN-01-AB-1234")
        v1.vehicle_model = VehicleModel.find_by(name: "Mahindra 575 DI Tractor")
        v1.name = "Mahindra 575 DI Tractor"
        v1.category = :tractor
        v1.status = :available
        v1.hourly_rate_cents = 80000
        v1.daily_rate_cents = 500000
        v1.model_year = 2023
        v1.latitude = 13.0827
        v1.longitude = 80.2707
        v1.save!

        v2 = Vehicle.find_or_initialize_by(registration_number: "TN-02-CD-5678")
        v2.vehicle_model = VehicleModel.find_by(name: "JCB 3DX Backhoe Loader")
        v2.name = "JCB 3DX Backhoe Loader"
        v2.category = :jcb
        v2.status = :available
        v2.hourly_rate_cents = 150000
        v2.daily_rate_cents = 1000000
        v2.model_year = 2024
        v2.latitude = 13.0850
        v2.longitude = 80.2750
        v2.save!

        v3 = Vehicle.find_or_initialize_by(registration_number: "TN-03-EF-9012")
        v3.vehicle_model = VehicleModel.find_by(name: "Tata Ace Gold")
        v3.name = "Tata Ace Gold"
        v3.category = :heavy_vehicle
        v3.status = :available
        v3.hourly_rate_cents = 50000
        v3.daily_rate_cents = 400000
        v3.model_year = 2022
        v3.latitude = 13.0810
        v3.longitude = 80.2710
        v3.save!

        v4 = Vehicle.find_or_initialize_by(registration_number: "TN-04-GH-3456")
        v4.vehicle_model = VehicleModel.find_by(name: "Ashok Leyland Dost+")
        v4.name = "Ashok Leyland Dost+"
        v4.category = :heavy_vehicle
        v4.status = :available
        v4.hourly_rate_cents = 60000
        v4.daily_rate_cents = 450000
        v4.model_year = 2023
        v4.latitude = 13.0830
        v4.longitude = 80.2730
        v4.save!

        # Additional Indian vehicles for pagination
        additional_vehicles = [
          { name: "Mahindra 275 DI TU", category: :tractor, hourly: 60000, daily: 400000, year: 2021 },
          { name: "Mahindra YUVO 575 DI", category: :tractor, hourly: 85000, daily: 550000, year: 2022 },
          { name: "Mahindra NOVO 605 DI-i", category: :tractor, hourly: 90000, daily: 600000, year: 2023 },
          { name: "Mahindra JIVO 245 DI", category: :tractor, hourly: 50000, daily: 350000, year: 2020 },
          { name: "Mahindra Arjun 555 DI", category: :tractor, hourly: 80000, daily: 500000, year: 2019 },
          { name: "Swaraj 744 FE", category: :tractor, hourly: 70000, daily: 450000, year: 2022 },
          { name: "Sonalika DI 745 III", category: :tractor, hourly: 75000, daily: 480000, year: 2021 },
          { name: "Escorts Powertrac Euro 50", category: :tractor, hourly: 70000, daily: 460000, year: 2020 },
          { name: "John Deere 5310", category: :tractor, hourly: 90000, daily: 580000, year: 2022 },
          { name: "New Holland 3630 TX Plus", category: :tractor, hourly: 85000, daily: 550000, year: 2023 },
          { name: "Eicher 380", category: :tractor, hourly: 65000, daily: 420000, year: 2021 },
          { name: "Kubota MU4501", category: :tractor, hourly: 80000, daily: 520000, year: 2022 },
          { name: "JCB 4DX", category: :jcb, hourly: 180000, daily: 1200000, year: 2023 },
          { name: "JCB 3DX Extra", category: :jcb, hourly: 160000, daily: 1100000, year: 2022 },
          { name: "Tata Signa 4923.S", category: :heavy_vehicle, hourly: 120000, daily: 850000, year: 2021 },
          { name: "Tata Prima 2825.K", category: :heavy_vehicle, hourly: 150000, daily: 1000000, year: 2023 },
          { name: "Ashok Leyland Captain 2518", category: :heavy_vehicle, hourly: 130000, daily: 900000, year: 2020 },
          { name: "Ashok Leyland U-4923", category: :heavy_vehicle, hourly: 125000, daily: 880000, year: 2021 },
          { name: "Eicher Pro 6025T", category: :heavy_vehicle, hourly: 110000, daily: 800000, year: 2022 },
          { name: "BharatBenz 2823C", category: :heavy_vehicle, hourly: 140000, daily: 950000, year: 2023 },
          { name: "Tata LPT 1109", category: :heavy_vehicle, hourly: 80000, daily: 550000, year: 2019 },
          { name: "Volvo FMX 460", category: :heavy_vehicle, hourly: 250000, daily: 1800000, year: 2023 },
          { name: "Tata LPO 1618", category: :bus, hourly: 100000, daily: 700000, year: 2021 },
          { name: "Ashok Leyland Viking", category: :bus, hourly: 95000, daily: 650000, year: 2020 },
          { name: "ACE FX 150", category: :crane, hourly: 200000, daily: 1500000, year: 2022 },
          { name: "Escorts Hydra 14", category: :crane, hourly: 150000, daily: 1000000, year: 2021 },
          { name: "ACE SX 150", category: :crane, hourly: 210000, daily: 1600000, year: 2023 },
          { name: "Claas Crop Tiger 40", category: :harvester, hourly: 120000, daily: 800000, year: 2022 },
          { name: "Preet 987", category: :harvester, hourly: 110000, daily: 750000, year: 2021 },
          { name: "Kartar 4000", category: :harvester, hourly: 115000, daily: 780000, year: 2022 }
        ]

        additional_vehicles.each_with_index do |v_data, index|
          reg_no = format("TN-%02d-XX-%04d", (index % 99) + 1, 1000 + index)
          v = Vehicle.find_or_initialize_by(registration_number: reg_no)
          
          # Link to VehicleModel if it exists
          model = VehicleModel.find_by(name: v_data[:name])
          v.vehicle_model = model
          
          v.name = v_data[:name]
          v.category = v_data[:category]
          v.status = :available
          v.hourly_rate_cents = v_data[:hourly]
          v.daily_rate_cents = v_data[:daily]
          v.model_year = v_data[:year]
          v.latitude = 13.0 + (rand * 0.2)
          v.longitude = 80.2 + (rand * 0.2)
          v.save!
        end

        pricing_rule = PricingRule.find_or_initialize_by(vehicle: v1, min_duration_hours: 8)
        pricing_rule.discount_percentage = 10.0
        pricing_rule.active = true
        pricing_rule.save!

        booking = Booking.find_or_initialize_by(
          vehicle: v1,
          customer: customer_user
        )
        if booking.new_record?
          booking.driver = driver_user
          booking.start_time = 1.day.from_now
          booking.end_time = 2.days.from_now
          booking.total_cents = 500000
          booking.advance_cents = 100000
          booking.status = :confirmed
          booking.payment_status = :advance_paid
          booking.save!
        end

        payroll = DriverPayroll.find_or_initialize_by(
          driver: driver_user,
          period_start: 1.month.ago.to_date
        )
        if payroll.new_record?
          payroll.period_end = Date.current
          payroll.completed_jobs_count = 12
          payroll.total_hours_worked = 96.0
          payroll.base_pay_cents = 2500000
          payroll.bonus_cents = 200000
          payroll.deductions_cents = 50000
          payroll.total_payout_cents = 2650000
          payroll.status = :approved
          payroll.save!
        end
      end
    end
  end
end
