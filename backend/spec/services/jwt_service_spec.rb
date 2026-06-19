require "rails_helper"

RSpec.describe JwtService do
  describe "access tokens" do
    it "round-trips sub, role, tenant, and type" do
      token = described_class.encode_access(subject: "user-uuid", role: "customer", tenant: "acme")
      payload = described_class.decode(token)

      expect(payload).to include(
        "sub" => "user-uuid", "role" => "customer", "tenant" => "acme", "type" => "access"
      )
      expect(payload["jti"]).to be_present
      expect(payload["exp"]).to be > Time.now.to_i
    end
  end

  describe "refresh tokens" do
    it "round-trips sub, tenant, jti, and family" do
      token = described_class.encode_refresh(subject: "user-uuid", tenant: "acme", jti: "j1", family: "f1")
      payload = described_class.decode(token)

      expect(payload).to include(
        "sub" => "user-uuid", "tenant" => "acme", "type" => "refresh", "jti" => "j1", "family" => "f1"
      )
    end
  end

  describe ".decode" do
    it "returns nil for a tampered token" do
      token = described_class.encode_access(subject: "u", role: "customer", tenant: "acme")
      expect(described_class.decode("#{token}tampered")).to be_nil
    end

    it "returns nil for an expired token" do
      expired = described_class.encode(sub: "u", type: "access", exp: 1.hour.ago.to_i)
      expect(described_class.decode(expired)).to be_nil
    end

    it "returns nil for a token signed with the wrong key" do
      foreign = JWT.encode({ sub: "u" }, "not-the-secret", described_class::ALGORITHM)
      expect(described_class.decode(foreign)).to be_nil
    end
  end
end
