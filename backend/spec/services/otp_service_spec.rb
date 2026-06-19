require "rails_helper"

RSpec.describe OtpService do
  let(:user) { create(:user) }

  before { allow(described_class).to receive(:generate_code).and_return("123456") }

  describe ".issue" do
    it "creates a single active OTP and sends it via the notifier" do
      expect(Notifier).to receive(:deliver_otp).with(phone: user.phone, code: "123456")
      expect(described_class.issue(user)).to be_persisted
      expect(user.one_time_passwords.active.count).to eq(1)
    end

    it "invalidates a prior active OTP" do
      described_class.issue(user)
      described_class.issue(user)
      expect(user.one_time_passwords.active.count).to eq(1)
    end
  end

  describe ".verify" do
    before { described_class.issue(user) }

    it "succeeds with the right code and marks the phone verified" do
      expect(described_class.verify(user, "123456")).to have_attributes(ok: true)
      expect(user.reload.phone_verified?).to be(true)
    end

    it "fails and counts the attempt on a wrong code" do
      expect(described_class.verify(user, "000000")).to have_attributes(ok: false, error: "otp_invalid")
      expect(user.one_time_passwords.active.first.attempts).to eq(1)
    end

    it "locks after MAX_ATTEMPTS wrong tries" do
      OneTimePassword::MAX_ATTEMPTS.times { described_class.verify(user, "000000") }
      expect(described_class.verify(user, "123456")).to have_attributes(ok: false, error: "otp_locked")
    end

    it "is single-use" do
      described_class.verify(user, "123456")
      expect(described_class.verify(user, "123456")).to have_attributes(ok: false, error: "otp_not_found")
    end
  end

  it "returns otp_not_found when no code was issued" do
    expect(described_class.verify(user, "123456")).to have_attributes(ok: false, error: "otp_not_found")
  end

  describe ".generate_code" do
    before { allow(described_class).to receive(:generate_code).and_call_original }

    it "is a zero-padded 6-digit code" do
      expect(described_class.generate_code).to match(/\A\d{6}\z/)
    end
  end
end
