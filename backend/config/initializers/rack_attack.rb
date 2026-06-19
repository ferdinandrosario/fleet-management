# Request throttling (OWASP — brute force, credential stuffing, OTP abuse,
# scraping). Limits are deliberately coarse here; the auth/OTP limits are
# tightened per-phone in Session 3 when those endpoints land. The throttled
# paths may not exist yet — Rack::Attack runs before routing, so the guards
# are in place before the controllers are.

# The test environment's Rails cache is a null store, which cannot count.
# Use an in-memory store there so throttle specs are meaningful; dev/prod use
# Rails.cache (Solid Cache), shared across processes.
Rack::Attack.cache.store =
  Rails.env.test? ? ActiveSupport::Cache::MemoryStore.new : Rails.cache

# Never throttle liveness probes.
Rack::Attack.safelist("allow/health") do |req|
  req.path == "/up" || req.path == "/api/v1/health"
end

# Coarse per-IP ceiling across the API — a backstop against scraping. The
# tighter limits below guard the sensitive endpoints specifically.
Rack::Attack.throttle("req/ip", limit: 300, period: 5.minutes) do |req|
  req.ip if req.path.start_with?("/api/")
end

# Credential stuffing / brute force on login.
Rack::Attack.throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
  req.ip if req.post? && req.path == "/api/v1/auth/login"
end

# OTP request + verify abuse (per-phone throttle added with the OTP feature).
Rack::Attack.throttle("otp/ip", limit: 5, period: 1.minute) do |req|
  req.ip if req.post? && req.path.start_with?("/api/v1/auth/otp")
end

# Password-reset abuse.
Rack::Attack.throttle("password_reset/ip", limit: 5, period: 1.hour) do |req|
  req.ip if req.post? && req.path.start_with?("/api/v1/auth/password")
end

# Payment endpoints. Razorpay webhooks are excluded — they're authenticated by
# signature, not IP, and must not be dropped under load.
Rack::Attack.throttle("payments/ip", limit: 30, period: 1.minute) do |req|
  req.ip if req.path.start_with?("/api/v1/payments") && !req.path.end_with?("/webhook")
end

# Discovery/search.
Rack::Attack.throttle("search/ip", limit: 60, period: 1.minute) do |req|
  req.ip if req.get? && req.path.start_with?("/api/v1/vehicles/search")
end

# Throttled requests get the standard error envelope, not Rack::Attack's HTML.
Rack::Attack.throttled_responder = lambda do |request|
  match_data = request.env["rack.attack.match_data"] || {}
  retry_after = (match_data[:period] || 60).to_s
  body = {
    status: "error",
    data: nil,
    error: { code: "rate_limited", message: "Too many requests. Please retry later." }
  }.to_json
  [ 429, { "Content-Type" => "application/json", "Retry-After" => retry_after }, [ body ] ]
end

Rails.application.config.middleware.use Rack::Attack
