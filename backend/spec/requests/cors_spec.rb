require "rails_helper"

# Verifies the strict CORS allowlist (config/initializers/cors.rb): a
# configured browser origin is echoed back; anything else is not.
RSpec.describe "CORS", type: :request do
  it "allows a configured origin" do
    get "/api/v1/health", headers: { "Origin" => "http://localhost:5173" }
    expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:5173")
  end

  it "does not echo an unconfigured origin" do
    get "/api/v1/health", headers: { "Origin" => "https://evil.example.com" }
    expect(response.headers["Access-Control-Allow-Origin"]).to be_nil
  end
end
