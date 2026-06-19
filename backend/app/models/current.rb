# Per-request context (reset between requests). `tenant` is the resolved tenant
# slug; `user` is the authenticated tenant user. Set by the TenantResolution and
# Authentication concerns; read by controllers, policies, and audit stamping.
class Current < ActiveSupport::CurrentAttributes
  attribute :tenant, :user
end
