# Be sure to restart your server when you modify this file.

# Configure parameters to be partially matched (e.g. passw matches password) and filtered from the log file.
# Use this to limit dissemination of sensitive information.
# See the ActiveSupport::ParameterFilter documentation for supported notations and behaviors.
# Default secret/credential filters, plus this app's PII (DPDP Act 2023) and
# payment fields. `:passw` matches password; `:token` matches access_token /
# refresh_token; `:_key` matches *_key. Precise location, phone, KYC and
# Razorpay payloads must never reach a log line.
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc,
  :phone, :phone_number, :authorization, :signature,
  :latitude, :longitude, :location, :lat, :lng, :coordinates,
  :razorpay, :upi, :vpa, :card, :pan, :aadhaar, :account_number, :ifsc, :kyc
]
