# Security response headers (OWASP hardening, docs/security/threat-model.md).
#
# This is a JSON API — it serves no HTML, scripts, styles, frames, or
# images of its own. So the Content-Security-Policy is locked all the way
# down to `default_src 'none'`: there is nothing legitimate to load, and a
# response that somehow rendered markup can't pull in anything.
SecureHeaders::Configuration.default do |config|
  # Force HTTPS for a year, including subdomains; eligible for the preload
  # list. Browsers only honor HSTS over HTTPS, so it's inert in local HTTP.
  config.hsts = "max-age=#{1.year.to_i}; includeSubDomains; preload"

  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.referrer_policy = "strict-origin-when-cross-origin"

  # `script_src` must be set explicitly — secure_headers refuses to let it
  # silently fall back to `default_src`. For a JSON API it's also 'none'.
  config.csp = {
    default_src: %w['none'],
    script_src: %w['none'],
    frame_ancestors: %w['none']
  }
end
