# Adapter boundary for outbound messages (SMS / WhatsApp / push / email).
# Dev/test use this mock — it logs and never costs money. Live providers
# (MSG91 / Twilio, etc.) are wired in Session 9 behind this same interface, so
# going live is a config change, not a rewrite (Deferred Paid Items).
module Notifier
  module_function

  def deliver_otp(phone:, code:)
    Rails.logger.info("[Notifier:mock] OTP for #{phone}: #{code}")
    send_whatsapp_message(phone: phone, message: "Your OTP is #{code}") if ENV["WHATSAPP_ENABLED"] == "true"
    true
  end

  def send_whatsapp_message(phone:, message:)
    Rails.logger.info("[Notifier:WhatsApp] To: #{phone} | Message: #{message}")
    true
  end

  def dispatch_growth_lead(channel:, payload:)
    case channel.to_sym
    when :whatsapp
      Rails.logger.info("[Notifier:WhatsAppLead] #{payload}")
    when :instagram
      Rails.logger.info("[Notifier:InstagramLead] #{payload}")
    when :justdial
      Rails.logger.info("[Notifier:JustDialLead] #{payload}")
    when :sulekha
      Rails.logger.info("[Notifier:SulekhaLead] #{payload}")
    else
      Rails.logger.info("[Notifier:UnknownChannel] #{channel}: #{payload}")
    end
    true
  end
end
