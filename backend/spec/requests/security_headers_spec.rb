require "rails_helper"

# Verifies the OWASP hardening headers (config/initializers/secure_headers.rb)
# are actually attached to responses, not just configured.
RSpec.describe "Security headers", type: :request do
  before { get "/api/v1/health" }

  it "denies framing" do
    expect(response.headers["X-Frame-Options"]).to eq("DENY")
  end

  it "blocks content-type sniffing" do
    expect(response.headers["X-Content-Type-Options"]).to eq("nosniff")
  end

  it "sets a strict referrer policy" do
    expect(response.headers["Referrer-Policy"]).to eq("strict-origin-when-cross-origin")
  end

  it "locks the content security policy down to 'none'" do
    expect(response.headers["Content-Security-Policy"]).to include("default-src 'none'")
  end
end
