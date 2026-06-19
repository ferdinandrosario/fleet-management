# N+1 and unused-eager-load detection. Bullet is loaded only in development
# and test (Gemfile group), so guard on the constant — it's undefined in
# production. In test it RAISES, so an N+1 fails the build (a missing
# `includes`/`preload` is a bug, not a warning).
if defined?(Bullet)
  Rails.application.config.after_initialize do
    Bullet.enable = true
    Bullet.raise = Rails.env.test?
    Bullet.bullet_logger = true
    Bullet.rails_logger = Rails.env.development?
  end
end
