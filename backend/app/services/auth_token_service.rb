# Issues and rotates the access/refresh token pair. The refresh token is the
# revocation point: each rotation revokes the old jti and issues a new one in
# the same family; presenting a revoked jti (token theft) revokes the whole
# family. Runs inside the tenant schema (RefreshToken is tenant-scoped).
module AuthTokenService
  module_function

  Pair = Struct.new(:access, :refresh, keyword_init: true)

  def issue(user, tenant:)
    create_pair(user, tenant: tenant, family: SecureRandom.uuid)
  end

  # Returns a new Pair, or nil if the refresh token is invalid/expired/reused.
  def rotate(refresh_jwt, tenant:)
    payload = JwtService.decode(refresh_jwt)
    return nil if payload.nil? || payload["type"] != "refresh" || payload["tenant"] != tenant

    record = RefreshToken.find_by(jti: payload["jti"])
    return nil if record.nil?

    unless record.active?
      # Reuse of a revoked/expired token = theft signal → revoke the family.
      RefreshToken.where(family: record.family).update_all(revoked_at: Time.current)
      return nil
    end

    record.update!(revoked_at: Time.current)
    create_pair(record.user, tenant: tenant, family: record.family)
  end

  def revoke_all(user)
    user.refresh_tokens.active.update_all(revoked_at: Time.current)
  end

  def create_pair(user, tenant:, family:)
    jti = SecureRandom.uuid
    user.refresh_tokens.create!(jti: jti, family: family, expires_at: JwtService::REFRESH_TTL.from_now)
    Pair.new(
      access: JwtService.encode_access(subject: user.uuid, role: user.role, tenant: tenant),
      refresh: JwtService.encode_refresh(subject: user.uuid, tenant: tenant, jti: jti, family: family)
    )
  end
end
