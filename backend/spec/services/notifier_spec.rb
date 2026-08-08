require "rails_helper"

RSpec.describe Notifier do
  describe ".deliver_otp" do
    it "logs and delivers OTP" do
      expect(described_class.deliver_otp(phone: "+919876543210", code: "123456")).to be true
    end

    it "sends whatsapp message when enabled" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("WHATSAPP_ENABLED").and_return("true")

      expect(described_class).to receive(:send_whatsapp_message).with(phone: "+919876543210", message: "Your OTP is 123456").and_call_original
      expect(described_class.deliver_otp(phone: "+919876543210", code: "123456")).to be true
    end
  end

  describe ".dispatch_growth_lead" do
    it "dispatches leads across channels" do
      %i[whatsapp instagram justdial sulekha unknown].each do |channel|
        expect(described_class.dispatch_growth_lead(channel: channel, payload: "lead data")).to be true
      end
    end
  end
end
