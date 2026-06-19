# Encodes/decodes the app's JWTs (custom token service — see docs/feature/auth.md
# for why not devise-jwt). Two token types:
#   - access  (short-lived, ~15 min): carries sub (user uuid), role, tenant.
#   - refresh (long-lived, rotating):  carries sub, tenant, jti, family.
# Signed with the app's secret_key_base (HS256). Access tokens are short enough
# that we don't denylist them; refresh tokens are tracked + revocable in the DB
# (RefreshToken), which is the real revocation mechanism.
module JwtService
  module_function

  ACCESS_TTL = 15.minutes
  REFRESH_TTL = 30.days
  ALGORITHM = "HS256"

  def encode_access(subject:, role:, tenant:)
    encode(
      sub: subject, role: role, tenant: tenant, type: "access",
      jti: SecureRandom.uuid, exp: ACCESS_TTL.from_now.to_i
    )
  end

  def encode_refresh(subject:, tenant:, jti:, family:)
    encode(
      sub: subject, tenant: tenant, type: "refresh",
      jti: jti, family: family, exp: REFRESH_TTL.from_now.to_i
    )
  end

  # Returns the payload hash (string keys), or nil for any invalid/expired token.
  def decode(token)
    payload, = JWT.decode(token, secret, true, algorithm: ALGORITHM)
    payload
  rescue JWT::DecodeError
    nil
  end

  def encode(payload)
    JWT.encode(payload, secret, ALGORITHM)
  end

  def secret
    Rails.application.secret_key_base
  end
end
