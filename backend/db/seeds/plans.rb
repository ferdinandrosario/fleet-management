# frozen_string_literal: true

module Seeds
  module Plans
    def self.seed!
      [
        {
          tier: :basic,
          name: "Basic Tier",
          interval: :monthly,
          price_paise: 199900,
          active: true,
          limits: { "vehicles" => 5, "drivers" => 5 }
        },
        {
          tier: :pro,
          name: "Pro Tier",
          interval: :monthly,
          price_paise: 499900,
          active: true,
          limits: { "vehicles" => 25, "drivers" => 25 }
        },
        {
          tier: :enterprise,
          name: "Enterprise Tier",
          interval: :monthly,
          price_paise: 1499900,
          active: true,
          limits: {}
        }
      ].each do |attrs|
        plan = Plan.find_or_initialize_by(tier: attrs[:tier])
        plan.update!(attrs)
      end
    end
  end
end
