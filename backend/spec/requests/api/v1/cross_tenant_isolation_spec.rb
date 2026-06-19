require "rails_helper"

# The #1 security property: a user/token for one tenant can never reach another
# tenant's data. Exercised end-to-end through the real auth + tenant-switch path.
RSpec.describe "Cross-tenant isolation", :tenant_schema, type: :request do
  let(:phone) { "+919876500001" }
  let(:password) { "Str0ng$Pass1" }

  before do
    provision_tenant("alpha")
    provision_tenant("beta")
    in_tenant("alpha") { create(:user, :verified, phone:, password:) }
  end

  after do
    drop_tenant("alpha")
    drop_tenant("beta")
  end

  def json = response.parsed_body

  it "rejects an alpha-issued token used against tenant beta" do
    post "/api/v1/auth/login", params: { phone:, password: }, headers: { "X-Tenant" => "alpha" }
    token = json["data"]["access_token"]

    get "/api/v1/me", headers: { "X-Tenant" => "beta", "Authorization" => "Bearer #{token}" }
    expect(response).to have_http_status(:unauthorized) # tenant claim != resolved tenant
  end

  it "does not leak a user across tenant schemas" do
    expect(in_tenant("alpha") { User.count }).to eq(1)
    expect(in_tenant("beta") { User.count }).to eq(0)
  end

  it "alpha's login phone is unknown in beta" do
    post "/api/v1/auth/login", params: { phone:, password: }, headers: { "X-Tenant" => "beta" }
    expect(response).to have_http_status(:unauthorized)
    expect(json["error"]["code"]).to eq("invalid_credentials")
  end
end
