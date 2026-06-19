require "rails_helper"

RSpec.describe "Api::V1 auth", :tenant_schema, type: :request do
  let(:tenant) { "acme" }
  let(:tenant_headers) { { "X-Tenant" => tenant } }
  let(:phone) { "+919876543210" }
  let(:password) { "Str0ng$Pass1" }

  before do
    allow(OtpService).to receive(:generate_code).and_return("123456")
    provision_tenant(tenant)
  end

  after { drop_tenant(tenant) }

  def json
    response.parsed_body
  end

  def auth_headers(token)
    tenant_headers.merge("Authorization" => "Bearer #{token}")
  end

  describe "POST /auth/register" do
    let(:valid_user) { { name: "Ravi", phone: phone, password: password } }

    it "creates a customer and requires phone verification" do
      expect { post "/api/v1/auth/register", params: { user: valid_user }, headers: tenant_headers }
        .to change { in_tenant(tenant) { User.count } }.by(1)
      expect(response).to have_http_status(:created)
      expect(json["data"]["phone_verification_required"]).to be(true)
    end

    it "rejects invalid input with per-field errors" do
      post "/api/v1/auth/register",
           params: { user: { name: "", phone: "x", password: "short" } }, headers: tenant_headers
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]).to include("code" => "validation_failed")
      expect(json["error"]["fields"]).to include("phone")
    end

    it "forces the customer role (no privilege escalation from params)" do
      post "/api/v1/auth/register",
           params: { user: valid_user.merge(role: "owner_admin") }, headers: tenant_headers
      role = in_tenant(tenant) { User.find_by(uuid: json["data"]["id"]).role }
      expect(role).to eq("customer")
    end
  end

  describe "OTP" do
    before do
      post "/api/v1/auth/register",
           params: { user: { name: "Ravi", phone: phone, password: password } }, headers: tenant_headers
    end

    it "verifies the code and returns tokens" do
      post "/api/v1/auth/otp/verify", params: { phone: phone, code: "123456" }, headers: tenant_headers
      expect(response).to have_http_status(:ok)
      expect(json["data"]["access_token"]).to be_present
      expect(json["data"]["user"]["phone_verified"]).to be(true)
    end

    it "rejects a wrong code" do
      post "/api/v1/auth/otp/verify", params: { phone: phone, code: "000000" }, headers: tenant_headers
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]["code"]).to eq("otp_invalid")
    end

    it "does not enumerate: unknown phone still returns success" do
      post "/api/v1/auth/otp", params: { phone: "+910000000000" }, headers: tenant_headers
      expect(response).to have_http_status(:ok)
      expect(json["data"]["sent"]).to be(true)
    end

    it "re-sends a code for a known phone" do
      post "/api/v1/auth/otp", params: { phone: phone }, headers: tenant_headers
      expect(response).to have_http_status(:ok)
    end
  end

  describe "login / refresh / logout / profile" do
    before { in_tenant(tenant) { create(:user, :verified, phone: phone, password: password) } }

    def login
      post "/api/v1/auth/login", params: { phone: phone, password: password }, headers: tenant_headers
    end

    it "logs in a verified user" do
      login
      expect(response).to have_http_status(:ok)
      expect(json["data"]["access_token"]).to be_present
    end

    it "rejects a wrong password" do
      post "/api/v1/auth/login", params: { phone: phone, password: "nope" }, headers: tenant_headers
      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]["code"]).to eq("invalid_credentials")
    end

    it "blocks an unverified user" do
      in_tenant(tenant) { User.find_by(phone: phone).update!(phone_verified_at: nil) }
      login
      expect(response).to have_http_status(:forbidden)
      expect(json["error"]["code"]).to eq("phone_unverified")
    end

    it "rotates the refresh token and rejects reuse of the old one" do
      login
      old_refresh = json["data"]["refresh_token"]

      post "/api/v1/auth/refresh", params: { refresh_token: old_refresh }, headers: tenant_headers
      expect(response).to have_http_status(:ok)
      expect(json["data"]["refresh_token"]).not_to eq(old_refresh)

      post "/api/v1/auth/refresh", params: { refresh_token: old_refresh }, headers: tenant_headers
      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]["code"]).to eq("invalid_token")
    end

    it "returns the profile with a valid token, 401 without one" do
      login
      get "/api/v1/me", headers: auth_headers(json["data"]["access_token"])
      expect(response).to have_http_status(:ok)
      expect(json["data"]["role"]).to eq("customer")

      get "/api/v1/me", headers: tenant_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it "updates the saved locale" do
      login
      token = json["data"]["access_token"]
      patch "/api/v1/me", params: { user: { locale: "hi" } }, headers: auth_headers(token)
      expect(response).to have_http_status(:ok)
      expect(json["data"]["locale"]).to eq("hi")
    end

    it "rejects a profile update that fails validation" do
      login
      token = json["data"]["access_token"]
      patch "/api/v1/me", params: { user: { locale: "xx" } }, headers: auth_headers(token)
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "logout revokes refresh tokens" do
      login
      token = json["data"]["access_token"]
      old_refresh = json["data"]["refresh_token"]

      delete "/api/v1/auth/logout", headers: auth_headers(token)
      expect(response).to have_http_status(:ok)

      post "/api/v1/auth/refresh", params: { refresh_token: old_refresh }, headers: tenant_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects a refresh token presented as a Bearer access token" do
      login
      get "/api/v1/me", headers: auth_headers(json["data"]["refresh_token"])
      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects a validly-signed token for a user that doesn't exist" do
      token = JwtService.encode_access(subject: "missing-uuid", role: "customer", tenant: tenant)
      get "/api/v1/me", headers: auth_headers(token)
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "tenant resolution" do
    it "rejects an unknown X-Tenant" do
      post "/api/v1/auth/login",
           params: { phone: phone, password: password }, headers: { "X-Tenant" => "ghost" }
      expect(response).to have_http_status(:not_found)
      expect(json["error"]["code"]).to eq("unknown_tenant")
    end

    it "rejects a missing X-Tenant" do
      post "/api/v1/auth/login", params: { phone: phone, password: password }
      expect(response).to have_http_status(:not_found)
    end
  end
end
