class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Pagy::Method
  # Pagination (pagy) is wired into the base controller with the first
  # collection endpoint (Session 4), against pagy's installed API.

  # Resolve the request locale around every action (Accept-Language now; the
  # authenticated user's saved preference takes over in Session 3).
  around_action :switch_locale

  # Default-deny authorization: a Pundit failure anywhere becomes a 403 in the
  # standard envelope. Per-controller `verify_authorized` enforcement is turned
  # on as real policies land (Session 3+); the rescue lives here so the whole
  # API behaves identically.
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  # Standard success envelope — the single on-the-wire shape every endpoint
  # renders (backend/AGENTS.md "API"). Centralized so REST responses can't drift.
  def render_success(data:, status: :ok)
    render json: { status: "success", data:, error: nil }, status:
  end

  # Standard error envelope. `fields` carries per-attribute validation errors
  # (e.g. { email: ["is invalid"] }) and is omitted for non-validation errors.
  def render_error(code:, message:, status:, fields: nil)
    error = { code:, message: }
    error[:fields] = fields if fields
    render json: { status: "error", data: nil, error: }, status:
  end

  def forbidden
    render_error(code: "forbidden", message: I18n.t("errors.unauthorized"), status: :forbidden)
  end

  # Model validation errors → the standard validation envelope (per-field).
  def render_validation_errors(record)
    render_error(
      code: "validation_failed",
      message: I18n.t("errors.validation_failed"),
      status: :unprocessable_content,
      fields: record.errors.to_hash
    )
  end

  # The token-issuance response: access + refresh + the serialized user.
  def render_tokens(user, tokens, status: :ok)
    render_success(
      data: {
        access_token: tokens.access,
        refresh_token: tokens.refresh,
        user: UserSerializer.call(user)
      },
      status:
    )
  end

  def switch_locale(&action)
    I18n.with_locale(locale_from_request, &action)
  end

  # Best available locale from the Accept-Language header, else the default.
  # Region subtags are dropped (hi-IN -> hi); unsupported tags are skipped.
  def locale_from_request
    header = request.headers["Accept-Language"]
    return I18n.default_locale if header.blank?

    header.split(",")
          .map { |tag| tag.split(";").first.to_s.strip.split("-").first.to_sym }
          .find { |code| I18n.available_locales.include?(code) } || I18n.default_locale
  end
end
