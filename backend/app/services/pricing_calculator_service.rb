# Calculates rental quotes and applies duration/tier discounts (Session 5).
class PricingCalculatorService
  Result = Struct.new(:base_paise, :discount_paise, :final_paise, :applied_rule, keyword_init: true)

  class << self
    def call(vehicle:, hours: 0, days: 0, date: Date.current)
      total_hours = (days * 24) + hours
      return Result.new(base_paise: 0, discount_paise: 0, final_paise: 0, applied_rule: nil) if total_hours <= 0

      rule = find_applicable_rule(vehicle, total_hours: total_hours, date: date)

      hourly_rate = rule&.override_hourly_rate_paise || vehicle.hourly_rate_paise
      daily_rate = rule&.override_daily_rate_paise || (vehicle.daily_rate_paise > 0 ? vehicle.daily_rate_paise : vehicle.hourly_rate_paise * 24)

      base_paise = if days > 0
                     (days * daily_rate) + (hours * hourly_rate)
      else
                     hours * hourly_rate
      end

      discount_pct = rule&.discount_percentage || 0.0
      discount_paise = (base_paise * (discount_pct / 100.0)).round
      final_paise = [ base_paise - discount_paise, 0 ].max

      Result.new(
        base_paise: base_paise,
        discount_paise: discount_paise,
        final_paise: final_paise,
        applied_rule: rule
      )
    end

    private

    def find_applicable_rule(vehicle, total_hours:, date:)
      vehicle.pricing_rules.active
             .where("min_duration_hours <= ?", total_hours)
             .where("start_date IS NULL OR start_date <= ?", date)
             .where("end_date IS NULL OR end_date >= ?", date)
             .order(min_duration_hours: :desc, discount_percentage: :desc)
             .first
    end
  end
end
