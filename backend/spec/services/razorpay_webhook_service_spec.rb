require "rails_helper"

RSpec.describe RazorpayWebhookService do
  describe ".call" do
    context "when event is missing or invalid" do
      it "returns failure if event is blank" do
        result = described_class.call(event: nil)
        expect(result).not_to be_success
        expect(result.errors).to eq({ event: [ "is required" ] })
      end

      it "returns success early if event name is blank" do
        result = described_class.call(event: { "payload" => {} })
        expect(result).to be_success
      end

      it "returns success early if payload is blank" do
        result = described_class.call(event: { "event" => "subscription.active" })
        expect(result).to be_success
      end
    end

    context "with subscription events" do
      let(:owner) { create(:owner, status: :active) }
      let!(:subscription) { create(:subscription, owner: owner, razorpay_subscription_id: "sub_123", status: :active) }

      it "ignores the event if subscription entity is missing" do
        result = described_class.call(event: { "event" => "subscription.active", "payload" => {} })
        expect(result).to be_success
      end

      it "ignores the event if subscription is not found in database" do
        event = {
          "event" => "subscription.active",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_999", "status" => "active" } } }
        }
        result = described_class.call(event: event)
        expect(result).to be_success
      end

      it "does nothing if status is unmapped or identical" do
        event = {
          "event" => "subscription.charged",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "active" } } }
        }
        expect {
          described_class.call(event: event)
        }.not_to change { subscription.reload.status }
      end

      it "updates status to past_due and suspends owner on halted" do
        event = {
          "event" => "subscription.halted",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "halted" } } }
        }

        result = described_class.call(event: event)
        expect(result).to be_success

        expect(subscription.reload.status).to eq("past_due")
        expect(owner.reload.status).to eq("suspended")
      end

      it "updates status to past_due and suspends owner on paused" do
        event = {
          "event" => "subscription.halted",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "paused" } } }
        }

        result = described_class.call(event: event)
        expect(result).to be_success

        expect(subscription.reload.status).to eq("past_due")
        expect(owner.reload.status).to eq("suspended")
      end

      it "updates status to canceled and suspends owner on cancelled" do
        event = {
          "event" => "subscription.cancelled",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "cancelled" } } }
        }

        result = described_class.call(event: event)
        expect(result).to be_success

        expect(subscription.reload.status).to eq("canceled")
        expect(owner.reload.status).to eq("suspended")
      end

      it "updates status to canceled and suspends owner on completed" do
        event = {
          "event" => "subscription.cancelled",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "completed" } } }
        }

        result = described_class.call(event: event)
        expect(result).to be_success

        expect(subscription.reload.status).to eq("canceled")
        expect(owner.reload.status).to eq("suspended")
      end

      it "activates owner when subscription becomes active" do
        subscription.update!(status: :past_due)
        owner.update!(status: :suspended)

        event = {
          "event" => "subscription.active",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "active" } } }
        }

        result = described_class.call(event: event)
        expect(result).to be_success

        expect(subscription.reload.status).to eq("active")
        expect(owner.reload.status).to eq("active")
      end

      it "handles unexpected status gracefully" do
        event = {
          "event" => "subscription.charged",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "unknown_status" } } }
        }
        expect {
          described_class.call(event: event)
        }.not_to change { subscription.reload.status }
      end
    end

    context "with payment and order events" do
      let(:slug) { "demotenantwebhook" }

      before do
        provision_tenant(slug)
      end

      it "updates booking payment status on payment.captured and payment.failed" do
        Apartment::Tenant.switch(slug) do
          customer = create(:user, role: :customer)
          vehicle = create(:vehicle)
          create(:booking, vehicle: vehicle, customer: customer, razorpay_order_id: "order_captured_123", payment_status: :pending)
          create(:booking, vehicle: vehicle, customer: customer, razorpay_order_id: "order_failed_123", payment_status: :pending)
        end

        captured_event = {
          "event" => "payment.captured",
          "payload" => { "payment" => { "entity" => { "order_id" => "order_captured_123", "status" => "captured", "notes" => { "tenant_slug" => slug } } } }
        }
        expect(described_class.call(event: captured_event)).to be_success

        failed_event = {
          "event" => "payment.failed",
          "payload" => { "payment" => { "entity" => { "order_id" => "order_failed_123", "status" => "failed", "notes" => { "tenant_slug" => slug } } } }
        }
        expect(described_class.call(event: failed_event)).to be_success

        Apartment::Tenant.switch(slug) do
          expect(Booking.find_by(razorpay_order_id: "order_captured_123").payment_status).to eq("advance_paid")
          expect(Booking.find_by(razorpay_order_id: "order_failed_123").payment_status).to eq("pending")
        end
      end

      it "updates booking payment status on order.paid" do
        Apartment::Tenant.switch(slug) do
          customer = create(:user, role: :customer)
          vehicle = create(:vehicle)
          create(:booking, vehicle: vehicle, customer: customer, razorpay_order_id: "order_paid_123", payment_status: :pending)
        end

        order_event = {
          "event" => "order.paid",
          "payload" => { "order" => { "entity" => { "id" => "order_paid_123", "status" => "paid", "notes" => { "tenant_slug" => slug } } } }
        }
        expect(described_class.call(event: order_event)).to be_success

        Apartment::Tenant.switch(slug) do
          expect(Booking.find_by(razorpay_order_id: "order_paid_123").payment_status).to eq("advance_paid")
        end
      end
    end

    context "with unknown events" do
      it "returns success automatically" do
        event = {
          "event" => "some.other.event",
          "payload" => { "entity" => { "id" => "123" } }
        }
        result = described_class.call(event: event)
        expect(result).to be_success
      end

      it "returns success early if event_id is already cached" do
        event = { "event_id" => "evt_duplicate_999", "event" => "payment.captured", "payload" => {} }
        Rails.cache.write("razorpay_webhook_event:evt_duplicate_999", true)
        expect(described_class.call(event: event)).to be_success
      end
    end

    context "when an exception occurs" do
      it "rescues and returns a failure result" do
        allow(Subscription).to receive(:find_by).and_raise(StandardError.new("DB Error"))

        event = {
          "event" => "subscription.active",
          "payload" => { "subscription" => { "entity" => { "id" => "sub_123", "status" => "active" } } }
        }

        result = described_class.call(event: event)
        expect(result).not_to be_success
        expect(result.errors).to eq({ base: [ "DB Error" ] })
      end
    end
  end
end
