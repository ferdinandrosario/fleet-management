require "rails_helper"

# Verifies Rack::Attack (config/initializers/rack_attack.rb): sensitive paths
# are throttled with the standard error envelope; health is safelisted.
RSpec.describe "Rate limiting", type: :request do
  it "throttles repeated login attempts from one IP with a 429 envelope" do
    6.times { post "/api/v1/auth/login" }

    expect(response).to have_http_status(:too_many_requests)
    body = response.parsed_body
    expect(body["status"]).to eq("error")
    expect(body["error"]["code"]).to eq("rate_limited")
    expect(response.headers["Retry-After"]).to be_present
  end

  it "never throttles the safelisted health endpoint" do
    305.times { get "/api/v1/health" } # past the 300/5min req/ip ceiling
    expect(response).to have_http_status(:ok)
  end
end
