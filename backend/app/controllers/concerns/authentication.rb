# Authenticates the request from the Bearer access token and pins Current.user.
# Layer 3 of isolation: the token's tenant claim must equal the tenant resolved
# from X-Tenant (a mismatch is rejected), and the user is loaded *inside* the
# tenant schema — so a token for tenant A can never resolve a tenant-B user.
module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    payload = JwtService.decode(bearer_token)
    return unauthorized if invalid_access?(payload)

    Current.user = User.find_by(uuid: payload["sub"])
    unauthorized if Current.user.nil?
  end

  def invalid_access?(payload)
    payload.nil? || payload["type"] != "access" || payload["tenant"] != Current.tenant
  end

  def bearer_token
    request.headers["Authorization"].to_s.delete_prefix("Bearer ").strip.presence
  end

  def unauthorized
    render_error(code: "unauthorized", message: I18n.t("errors.unauthorized"), status: :unauthorized)
  end
end
