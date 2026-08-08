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

      event_id = event["event_id"] || event["id"]
      if event_id.present?
        cache_key = "razorpay_webhook_event:#{event_id}"
        return Result.new(success: true) if Rails.cache.exist?(cache_key)
        Rails.cache.write(cache_key, true, expires_in: 7.days)
      end

      event_name = event["event"]
      payload = event.dig("payload")

      return Result.new(success: true) if event_name.blank? || payload.blank?

      case event_name
      when "subscription.charged", "subscription.active", "subscription.authenticated", "subscription.pending", "subscription.paused", "subscription.halted", "subscription.cancelled", "mandate.authenticated"
        handle_subscription_event(payload.dig("subscription", "entity"))
      when "payment.captured", "payment.failed"
        handle_payment_event(payload.dig("payment", "entity"))
      when "order.paid"
        handle_order_event(payload.dig("order", "entity"))
      else
        # Unhandled event types are ignored safely
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

      subscription = Subscription.find_by(razorpay_subscription_id: razorpay_sub_id)
      return unless subscription

      mapped_status = case status
      when "active", "authenticated", "charged" then :active
      when "pending", "paused", "halted" then :past_due
      when "cancelled", "completed" then :canceled
      else nil
      end

      if mapped_status && subscription.status != mapped_status.to_s
        subscription.update!(status: mapped_status)

        if mapped_status.in?([ :canceled, :past_due ])
          subscription.owner.update!(status: :suspended)
        elsif mapped_status == :active
          subscription.owner.update!(status: :active)
        end
      end
    end

    def handle_payment_event(payment_entity)
      return unless payment_entity

      order_id = payment_entity["order_id"]
      status = payment_entity["status"]
      notes = payment_entity["notes"] || {}
      tenant_slug = notes["tenant_slug"] || notes[:tenant_slug]

      return unless tenant_slug.present? && TenantRegistry.exists?(slug: tenant_slug)

      Apartment::Tenant.switch(tenant_slug) do
        booking = Booking.find_by(razorpay_order_id: order_id)
        if booking
          if status == "captured"
            booking.update!(payment_status: :advance_paid)
          elsif status == "failed"
            booking.update!(payment_status: :pending)
          end
        end
      end
    end

    def handle_order_event(order_entity)
      return unless order_entity

      order_id = order_entity["id"]
      status = order_entity["status"]
      notes = order_entity["notes"] || {}
      tenant_slug = notes["tenant_slug"] || notes[:tenant_slug]

      return unless tenant_slug.present? && TenantRegistry.exists?(slug: tenant_slug)

      Apartment::Tenant.switch(tenant_slug) do
        booking = Booking.find_by(razorpay_order_id: order_id)
        if booking && status == "paid"
          booking.update!(payment_status: :advance_paid)
        end
      end
    end
  end
end
