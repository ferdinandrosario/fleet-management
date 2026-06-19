require "rails_helper"

RSpec.describe AuthTokenService do
  let(:user) { create(:user, :verified) }

  describe ".issue" do
    it "returns an access+refresh pair and records the refresh jti" do
      pair = described_class.issue(user, tenant: "acme")
      expect(JwtService.decode(pair.access)).to include(
        "type" => "access", "tenant" => "acme", "sub" => user.uuid, "role" => "customer"
      )
      payload = JwtService.decode(pair.refresh)
      expect(payload["type"]).to eq("refresh")
      expect(user.refresh_tokens.active.find_by(jti: payload["jti"])).to be_present
    end
  end

  describe ".rotate" do
    it "revokes the old token and issues a new one in the same family" do
      pair = described_class.issue(user, tenant: "acme")
      old = JwtService.decode(pair.refresh)

      rotated = described_class.rotate(pair.refresh, tenant: "acme")
      fresh = JwtService.decode(rotated.refresh)

      expect(user.refresh_tokens.find_by(jti: old["jti"])).to be_revoked
      expect(fresh["family"]).to eq(old["family"])
      expect(fresh["jti"]).not_to eq(old["jti"])
    end

    it "rejects a refresh token presented for a different tenant" do
      pair = described_class.issue(user, tenant: "acme")
      expect(described_class.rotate(pair.refresh, tenant: "other")).to be_nil
    end

    it "rejects and revokes the whole family on reuse of a rotated token" do
      pair = described_class.issue(user, tenant: "acme")
      family = JwtService.decode(pair.refresh)["family"]
      described_class.rotate(pair.refresh, tenant: "acme") # legitimate use

      expect(described_class.rotate(pair.refresh, tenant: "acme")).to be_nil # reuse
      expect(user.refresh_tokens.where(family: family).active).to be_empty
    end

    it "rejects a non-refresh (access) token" do
      access = JwtService.encode_access(subject: user.uuid, role: "customer", tenant: "acme")
      expect(described_class.rotate(access, tenant: "acme")).to be_nil
    end

    it "rejects an unknown jti" do
      foreign = JwtService.encode_refresh(subject: user.uuid, tenant: "acme", jti: "nope", family: "f")
      expect(described_class.rotate(foreign, tenant: "acme")).to be_nil
    end
  end

  describe ".revoke_all" do
    it "revokes every active refresh token for the user" do
      2.times { described_class.issue(user, tenant: "acme") }
      described_class.revoke_all(user)
      expect(user.refresh_tokens.active).to be_empty
    end
  end
end
