# Strict CORS allowlist (OWASP — never "*").
#
# Only browser clients are bound by CORS: the web admin (Vite, :5173) and
# Expo's web target (:8081). The native mobile app makes non-CORS requests
# and is unaffected. Origins come from CORS_ALLOWED_ORIGINS (comma-separated);
# the default covers local dev only. We use Bearer tokens, not cookies, so
# credentials are off.
allowed_origins =
  ENV.fetch("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8081")
     .split(",").map(&:strip).reject(&:empty?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)
    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: %w[X-Request-Id],
      credentials: false
  end
end
