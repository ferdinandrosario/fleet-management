# frozen_string_literal: true

module Seeds
  module DemoTenant
    def self.seed!
      pro_plan = Plan.find_by!(tier: :pro)
      owner = Owner.find_by(slug: "demo_tenant")

      unless owner
        result = TenantProvisioningService.call(
          name: "Demo Fleet Services",
          company_name: "Demo Fleet Logistics Pvt Ltd",
          address: "100 Anna Salai, Guindy, Chennai",
          slug: "demo_tenant",
          plan: pro_plan,
          owner_name: "Demo Owner",
          owner_phone: "+919876543210",
          password: "password123",
          status: :active
        )
        raise "Failed to provision demo tenant: #{result.errors.inspect}" unless result.success?

        owner = result.owner
      end

      Apartment::Tenant.switch("demo_tenant") do
        owner_user = User.find_or_initialize_by(phone: "+919876543210")
        owner_user.name = "Demo Owner"
        owner_user.password = "password123"
        owner_user.role = :owner_admin
        owner_user.phone_verified_at = Time.current
        owner_user.save!

        driver_user = User.find_or_initialize_by(phone: "+919876543211")
        driver_user.name = "Ramesh Kumar"
        driver_user.password = "password123"
        driver_user.role = :driver
        driver_user.phone_verified_at = Time.current
        driver_user.save!

        customer_user = User.find_or_initialize_by(phone: "+919876543212")
        customer_user.name = "Suresh Patel"
        customer_user.password = "password123"
        customer_user.role = :customer
        customer_user.phone_verified_at = Time.current
        customer_user.save!

        v1 = Vehicle.find_or_initialize_by(registration_number: "TN-01-AB-1234")
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
        v2.name = "JCB 3DX Backhoe Loader"
        v2.category = :jcb
        v2.status = :available
        v2.hourly_rate_cents = 150000
        v2.daily_rate_cents = 1000000
        v2.model_year = 2024
        v2.latitude = 13.0850
        v2.longitude = 80.2750
        v2.save!

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
