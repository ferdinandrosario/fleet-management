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
        v1.hourly_rate_paise = 80000
        v1.daily_rate_paise = 500000
        v1.model_year = 2023
        v1.latitude = 13.0827
        v1.longitude = 80.2707
        v1.save!

        v2 = Vehicle.find_or_initialize_by(registration_number: "TN-02-CD-5678")
        v2.vehicle_model = VehicleModel.find_by(name: "JCB 3DX Backhoe Loader")
        v2.name = "JCB 3DX Backhoe Loader"
        v2.category = :jcb
        v2.status = :available
        v2.hourly_rate_paise = 150000
        v2.daily_rate_paise = 1000000
        v2.model_year = 2024
        v2.latitude = 13.0850
        v2.longitude = 80.2750
        v2.save!

        v3 = Vehicle.find_or_initialize_by(registration_number: "TN-03-EF-9012")
        v3.vehicle_model = VehicleModel.find_by(name: "Tata Ace Gold")
        v3.name = "Tata Ace Gold"
        v3.category = :heavy_vehicle
        v3.status = :available
        v3.hourly_rate_paise = 50000
        v3.daily_rate_paise = 400000
        v3.model_year = 2022
        v3.latitude = 13.0810
        v3.longitude = 80.2710
        v3.save!

        v4 = Vehicle.find_or_initialize_by(registration_number: "TN-04-GH-3456")
        v4.vehicle_model = VehicleModel.find_by(name: "Ashok Leyland Dost+")
        v4.name = "Ashok Leyland Dost+"
        v4.category = :heavy_vehicle
        v4.status = :available
        v4.hourly_rate_paise = 60000
        v4.daily_rate_paise = 450000
        v4.model_year = 2023
        v4.latitude = 13.0830
        v4.longitude = 80.2730
        v4.save!

        # Expanded commercial fleet equipment for pagination & lazy loading testing (85+ vehicles)
        categories = [ :tractor, :jcb, :heavy_vehicle, :bus, :crane, :harvester ]
        vehicle_catalog = [
          # Tractors
          { name: "Mahindra 575 DI Tractor", category: :tractor, hourly: 80000, daily: 500000, year: 2023 },
          { name: "Mahindra 275 DI TU", category: :tractor, hourly: 60000, daily: 400000, year: 2021 },
          { name: "Mahindra YUVO 575 DI", category: :tractor, hourly: 85000, daily: 550000, year: 2022 },
          { name: "Mahindra NOVO 605 DI-i", category: :tractor, hourly: 90000, daily: 600000, year: 2023 },
          { name: "Mahindra JIVO 245 DI", category: :tractor, hourly: 50000, daily: 350000, year: 2020 },
          { name: "Mahindra Arjun 555 DI", category: :tractor, hourly: 80000, daily: 500000, year: 2019 },
          { name: "Swaraj 744 FE", category: :tractor, hourly: 70000, daily: 450000, year: 2022 },
          { name: "Swaraj 744 XT", category: :tractor, hourly: 72000, daily: 470000, year: 2023 },
          { name: "Sonalika DI 745 III", category: :tractor, hourly: 75000, daily: 480000, year: 2021 },
          { name: "Escorts Powertrac Euro 50", category: :tractor, hourly: 70000, daily: 460000, year: 2020 },
          { name: "John Deere 5310", category: :tractor, hourly: 90000, daily: 580000, year: 2022 },
          { name: "New Holland 3630 TX Plus", category: :tractor, hourly: 85000, daily: 550000, year: 2023 },
          { name: "Eicher 380", category: :tractor, hourly: 65000, daily: 420000, year: 2021 },
          { name: "Kubota MU4501", category: :tractor, hourly: 80000, daily: 520000, year: 2022 },
          { name: "Farmtrac 60 Powermaxx", category: :tractor, hourly: 78000, daily: 490000, year: 2021 },
          { name: "Captain 200 DI", category: :tractor, hourly: 45000, daily: 320000, year: 2020 },
          { name: "Solis 5015 E", category: :tractor, hourly: 82000, daily: 530000, year: 2023 },
          { name: "Preet 4549 4WD", category: :tractor, hourly: 74000, daily: 460000, year: 2022 },
          { name: "Force Abhiman 4WD", category: :tractor, hourly: 48000, daily: 330000, year: 2021 },

          # JCB / Heavy Excavators
          { name: "JCB 3DX Backhoe Loader", category: :jcb, hourly: 150000, daily: 1000000, year: 2024 },
          { name: "JCB 4DX Heavy Loader", category: :jcb, hourly: 180000, daily: 1200000, year: 2023 },
          { name: "JCB 3DX Extra", category: :jcb, hourly: 160000, daily: 1100000, year: 2022 },
          { name: "JCB 2DX Compact Excavator", category: :jcb, hourly: 130000, daily: 850000, year: 2021 },
          { name: "Caterpillar 424 Backhoe", category: :jcb, hourly: 190000, daily: 1300000, year: 2023 },
          { name: "CASE 770 EX Loader", category: :jcb, hourly: 155000, daily: 1050000, year: 2022 },
          { name: "Tata Hitachi Shinrai Prime", category: :jcb, hourly: 165000, daily: 1150000, year: 2023 },
          { name: "Bull HD76 Backhoe Loader", category: :jcb, hourly: 140000, daily: 950000, year: 2021 },
          { name: "Manitou MBL 100", category: :jcb, hourly: 175000, daily: 1200000, year: 2022 },

          # Heavy Vehicles / Commercial Trucks
          { name: "Tata Ace Gold", category: :heavy_vehicle, hourly: 50000, daily: 400000, year: 2022 },
          { name: "Ashok Leyland Dost+", category: :heavy_vehicle, hourly: 60000, daily: 450000, year: 2023 },
          { name: "Tata Signa 4923.S", category: :heavy_vehicle, hourly: 120000, daily: 850000, year: 2021 },
          { name: "Tata Prima 2825.K", category: :heavy_vehicle, hourly: 150000, daily: 1000000, year: 2023 },
          { name: "Ashok Leyland Captain 2518", category: :heavy_vehicle, hourly: 130000, daily: 900000, year: 2020 },
          { name: "Ashok Leyland U-4923", category: :heavy_vehicle, hourly: 125000, daily: 880000, year: 2021 },
          { name: "Eicher Pro 6025T", category: :heavy_vehicle, hourly: 110000, daily: 800000, year: 2022 },
          { name: "BharatBenz 2823C", category: :heavy_vehicle, hourly: 140000, daily: 950000, year: 2023 },
          { name: "Tata LPT 1109", category: :heavy_vehicle, hourly: 80000, daily: 550000, year: 2019 },
          { name: "Volvo FMX 460 Tipper", category: :heavy_vehicle, hourly: 250000, daily: 1800000, year: 2023 },
          { name: "Mahindra Blazo X 28", category: :heavy_vehicle, hourly: 135000, daily: 920000, year: 2022 },
          { name: "Eicher Pro 3019", category: :heavy_vehicle, hourly: 95000, daily: 650000, year: 2021 },
          { name: "Scania G440 Heavy Hauler", category: :heavy_vehicle, hourly: 270000, daily: 1950000, year: 2023 },
          { name: "Isuzu D-Max Commercial", category: :heavy_vehicle, hourly: 70000, daily: 480000, year: 2022 },

          # Buses / Passenger Transit
          { name: "Tata LPO 1618 Bus", category: :bus, hourly: 100000, daily: 700000, year: 2021 },
          { name: "Ashok Leyland Viking", category: :bus, hourly: 95000, daily: 650000, year: 2020 },
          { name: "Eicher Starline 40S", category: :bus, hourly: 90000, daily: 600000, year: 2022 },
          { name: "Force Traveller 3350", category: :bus, hourly: 75000, daily: 500000, year: 2023 },
          { name: "BharatBenz 1017 Bus", category: :bus, hourly: 110000, daily: 750000, year: 2022 },
          { name: "Volvo 9600 Multi-Axle", category: :bus, hourly: 220000, daily: 1600000, year: 2023 },

          # Cranes / Heavy Lifting
          { name: "ACE FX 150 Mobile Crane", category: :crane, hourly: 200000, daily: 1500000, year: 2022 },
          { name: "Escorts Hydra 14 Crane", category: :crane, hourly: 150000, daily: 1000000, year: 2021 },
          { name: "ACE SX 150 Crane", category: :crane, hourly: 210000, daily: 1600000, year: 2023 },
          { name: "Action Construction Crane 20T", category: :crane, hourly: 230000, daily: 1750000, year: 2023 },
          { name: "Kobelco CKL1000i Crawler", category: :crane, hourly: 350000, daily: 2500000, year: 2022 },

          # Harvesters / Agricultural
          { name: "Claas Crop Tiger 40", category: :harvester, hourly: 120000, daily: 800000, year: 2022 },
          { name: "Preet 987 Combine", category: :harvester, hourly: 110000, daily: 750000, year: 2021 },
          { name: "Kartar 4000 Paddy Harvester", category: :harvester, hourly: 115000, daily: 780000, year: 2022 },
          { name: "Dasmesh 912 Harvester", category: :harvester, hourly: 105000, daily: 720000, year: 2020 },
          { name: "Malkit 897 Grain Harvester", category: :harvester, hourly: 108000, daily: 730000, year: 2021 }
        ]

        # Generate 85 total vehicles across districts to populate paginated pages (Pagy limit = 20)
        all_vehicles = []
        tn_districts = [ 1, 2, 3, 4, 5, 7, 10, 11, 12, 15, 18, 20, 33, 37, 39, 45, 55, 60 ]

        85.times do |idx|
          item = vehicle_catalog[idx % vehicle_catalog.length]
          district = tn_districts[idx % tn_districts.length]
          reg_no = format("TN-%02d-XX-%04d", district, 1001 + idx)

          v = Vehicle.find_or_initialize_by(registration_number: reg_no)
          model = VehicleModel.find_by(name: item[:name])
          v.vehicle_model = model

          # Slight variation for uniqueness
          v.name = "#{item[:name]} ##{(idx / vehicle_catalog.length) + 1}" if idx >= vehicle_catalog.length
          v.name ||= item[:name]
          v.category = item[:category]
          v.status = [ :available, :available, :available, :booked, :maintenance ][idx % 5]
          v.hourly_rate_paise = item[:hourly] + ((idx % 5) * 5000)
          v.daily_rate_paise = item[:daily] + ((idx % 5) * 20000)
          v.model_year = item[:year]
          v.latitude = 13.0 + ((idx % 20) * 0.015)
          v.longitude = 80.2 + ((idx % 20) * 0.015)
          v.save!
          all_vehicles << v
        end

        pricing_rule = PricingRule.find_or_initialize_by(vehicle: all_vehicles.first, min_duration_hours: 8)
        pricing_rule.discount_percentage = 10.0
        pricing_rule.active = true
        pricing_rule.save!

        # Seed 50+ Bookings for Pagination Testing
        statuses = [ :confirmed, :in_progress, :completed, :cancelled ]
        payment_statuses = [ :pending, :advance_paid, :fully_paid, :refunded ]

        55.times do |b_idx|
          veh = all_vehicles[b_idx % all_vehicles.length]
          start_date = (b_idx - 25).days.from_now
          end_date = start_date + (1..3).to_a.sample.days

          booking = Booking.find_or_initialize_by(
            vehicle: veh,
            customer: customer_user
          )
          booking.start_time = start_date
          booking.driver = driver_user
          booking.end_time = end_date
          booking.total_paise = veh.daily_rate_paise * 2
          booking.advance_paise = (veh.daily_rate_paise * 0.2).round
          booking.status = statuses[b_idx % statuses.length]
          booking.payment_status = payment_statuses[b_idx % payment_statuses.length]
          booking.save!
        end

        # Seed 35+ Driver Payrolls for Pagination Testing
        35.times do |p_idx|
          start_dt = (p_idx + 1).months.ago.to_date
          payroll = DriverPayroll.find_or_initialize_by(
            driver: driver_user,
            period_start: start_dt
          )
          payroll.period_end = start_dt + 1.month - 1.day
          payroll.completed_jobs_count = 10 + (p_idx % 8)
          payroll.total_hours_worked = 80.0 + (p_idx * 2)
          payroll.base_pay_paise = 2500000 + (p_idx * 50000)
          payroll.bonus_paise = 200000 + (p_idx * 10000)
          payroll.deductions_paise = 50000
          payroll.total_payout_paise = payroll.base_pay_paise + payroll.bonus_paise - payroll.deductions_paise
          payroll.status = [ :draft, :approved, :paid ][p_idx % 3]
          payroll.save!
        end

        # Seed 35+ Driver Leaves for Pagination Testing
        35.times do |l_idx|
          l_start = (l_idx * 4).days.ago.to_date
          leave = DriverLeave.find_or_initialize_by(
            driver: driver_user,
            start_date: l_start
          )
          leave.end_date = l_start + 1.day
          leave.reason = [ "Medical Checkup", "Personal Work", "Family Event", "Harvest Season Duty" ][l_idx % 4]
          leave.status = [ :pending, :approved, :rejected ][l_idx % 3]
          leave.approved_by = owner_user if leave.approved?
          leave.save!
        end

        # Seed 35+ Reviews for Pagination Testing
        created_bookings = Booking.all.to_a
        35.times do |r_idx|
          b_target = created_bookings[r_idx % created_bookings.length]
          next unless b_target

          rev = Review.find_or_initialize_by(
            booking: b_target
          )
          rev.vehicle = b_target.vehicle
          rev.customer = customer_user
          rev.rating = [ 4, 5, 5, 3, 4, 5 ][r_idx % 6]
          rev.comment = [
            "Excellent machinery performance for soil excavation!",
            "Tractor engine ran smooth for all agricultural operations.",
            "Prompt delivery and professional driver service.",
            "Heavy vehicle kept good pace during long haul logistics.",
            "Great condition and full fuel tank provided."
          ][r_idx % 5]
          rev.save!
        end
      end
    end
  end
end
