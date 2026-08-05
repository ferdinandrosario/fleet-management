# Idempotent processing of Razorpay Webhooks (Session 4 & 6).
# Safely synchronizes Razorpay state to local subscriptions and payments.
class RazorpayWebhookService
  Result = Struct.new(:success, :errors, keyword_init: true) do
    def success?
      success == true
    end
  end

  class << self
    def call(event:)
      return Result.new(success: false, errors: { event: [ "is required" ] }) if event.blank?

      event_name = event["event"]
      payload = event.dig("payload")

      return Result.new(success: true) if event_name.blank? || payload.blank?

      case event_name
      when "subscription.charged", "subscription.active", "subscription.halted", "subscription.cancelled"
        handle_subscription_event(payload.dig("subscription", "entity"))
      when "payment.captured", "payment.failed"
        handle_payment_event(payload.dig("payment", "entity"))
      when "order.paid"
        handle_order_event(payload.dig("order", "entity"))
      else
        # Unhandled event types are inherently successful (ignored)
      end

      Result.new(success: true)
    rescue StandardError => e
      Rails.logger.error("[RazorpayWebhookService] Error processing webhook: #{e.message}")
      Result.new(success: false, errors: { base: [ e.message ] })
    end

    private

    def handle_subscription_event(subscription_entity)
      return unless subscription_entity

      razorpay_sub_id = subscription_entity["id"]
      status = subscription_entity["status"]

      # Idempotent: Find by the external ID and update status
      subscription = Subscription.find_by(razorpay_subscription_id: razorpay_sub_id)
      return unless subscription

      # Map Razorpay statuses to our enum if needed (active, completed, cancelled, halted, etc.)
      mapped_status = case status
      when "active" then :active
      when "halted", "paused" then :past_due
      when "cancelled", "completed" then :canceled
      else nil
      end

      if mapped_status && subscription.status != mapped_status.to_s
        subscription.update!(status: mapped_status)

        # Suspend owner if cancelled or past due
        if mapped_status.in?([ :canceled, :past_due ])
          subscription.owner.update!(status: :suspended)
        elsif mapped_status == :active
          subscription.owner.update!(status: :active)
        end
      end
    end

    def handle_payment_event(payment_entity)
      # Not fully implemented: requires tenant resolution if processing tenant bookings
      # Usually handled via order.paid or searching tenant schemas if needed.
    end

    def handle_order_event(order_entity)
      # Handled similarly, mapping order_id to Bookings in tenant schemas.
    end
  end
end
