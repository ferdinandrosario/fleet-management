# Hardened OTP issue + verify (the threat-model OTP controls). Codes are random,
# stored hashed (bcrypt), single active code per user, short expiry, attempt-
# capped, single-use. Per-phone/IP request throttling is rack-attack's job.
module OtpService
  module_function

  EXPIRY = 10.minutes
  CODE_LENGTH = 6

  Result = Struct.new(:ok, :error, keyword_init: true)

  # Invalidate any prior active code, create + send a fresh one. Returns the
  # OneTimePassword record (never the plaintext code — that only goes to Notifier).
  def issue(user)
    user.one_time_passwords.active.update_all(consumed_at: Time.current)
    code = generate_code
    otp = user.one_time_passwords.create!(
      code_digest: BCrypt::Password.create(code),
      expires_at: EXPIRY.from_now
    )
    Notifier.deliver_otp(phone: user.phone, code: code)
    otp
  end

  def verify(user, code)
    otp = user.one_time_passwords.active.order(created_at: :desc).first
    return Result.new(ok: false, error: "otp_not_found") if otp.nil?
    return Result.new(ok: false, error: "otp_locked") if otp.locked?

    unless BCrypt::Password.new(otp.code_digest) == code.to_s
      otp.increment!(:attempts)
      return Result.new(ok: false, error: "otp_invalid")
    end

    otp.update!(consumed_at: Time.current)
    user.update!(phone_verified_at: Time.current)
    Result.new(ok: true)
  end

  def generate_code
    SecureRandom.random_number(10**CODE_LENGTH).to_s.rjust(CODE_LENGTH, "0")
  end
end
