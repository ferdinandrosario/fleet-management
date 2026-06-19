# Adapter boundary for outbound messages (SMS / WhatsApp / push / email).
# Dev/test use this mock — it logs and never costs money. Live providers
# (MSG91 / Twilio, etc.) are wired in Session 9 behind this same interface, so
# going live is a config change, not a rewrite (Deferred Paid Items).
module Notifier
  module_function

  def deliver_otp(phone:, code:)
    Rails.logger.info("[Notifier:mock] OTP for #{phone}: #{code}")
    true
  end
end
