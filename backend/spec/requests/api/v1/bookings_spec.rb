require "rails_helper"

RSpec.describe "Api::V1::Bookings", :tenant_schema, type: :request do
  let(:slug) { "book_tenant_#{SecureRandom.hex(4)}" }
  let(:plan) { create(:plan) }

  before do
    provision_tenant(slug)
    Apartment::Tenant.reset
    owner = Owner.find_by!(slug: slug)
    owner.active!
    create(:subscription, owner: owner, plan: plan, status: :active)
  end

  after { drop_tenant(slug) }

  let(:customer_user) do
    in_tenant(slug) do
      create(:user, role: :customer)
    end
  end

  let(:token) { JwtService.encode_access(subject: customer_user.uuid, role: "customer", tenant: slug) }
  let(:headers) do
    {
      "Authorization" => "Bearer #{token}",
      "X-Tenant" => slug
    }
  end

  let(:vehicle) do
    in_tenant(slug) { create(:vehicle, status: :available, hourly_rate_paise: 50000) }
  end

  describe "GET /api/v1/bookings" do
    it "lists customer bookings" do
      b1 = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle) }

      get "/api/v1/bookings", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["bookings"].size).to eq(1)
      expect(json["data"]["bookings"].first["id"]).to eq(b1.uuid)
    end

    it "lists driver assigned bookings when authenticated as driver" do
      driver = in_tenant(slug) { create(:user, role: :driver) }
      b1 = in_tenant(slug) { create(:booking, customer: customer_user, driver: driver, vehicle: vehicle) }
      driver_token = JwtService.encode_access(subject: driver.uuid, role: "driver", tenant: slug)

      get "/api/v1/bookings", headers: { "Authorization" => "Bearer #{driver_token}", "X-Tenant" => slug }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["bookings"].size).to eq(1)
      expect(json["data"]["bookings"].first["id"]).to eq(b1.uuid)
    end

    it "lists all tenant bookings when authenticated as owner_admin" do
      _b1 = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle) }
      admin = in_tenant(slug) { create(:user, role: :owner_admin) }
      admin_token = JwtService.encode_access(subject: admin.uuid, role: "owner_admin", tenant: slug)

      get "/api/v1/bookings", headers: { "Authorization" => "Bearer #{admin_token}", "X-Tenant" => slug }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["bookings"].size).to eq(1)
    end
  end

  describe "GET /api/v1/bookings/:id" do
    it "shows booking details" do
      booking = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle) }

      get "/api/v1/bookings/#{booking.uuid}", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["id"]).to eq(booking.uuid)
    end

    it "returns 404 for unknown booking uuid" do
      get "/api/v1/bookings/00000000-0000-0000-0000-000000000000", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/bookings" do
    it "creates a new booking reservation" do
      st = (2.hours.from_now).iso8601
      et = (6.hours.from_now).iso8601

      post "/api/v1/bookings", headers: headers, params: {
        vehicle_id: vehicle.uuid,
        start_time: st,
        end_time: et,
        pickup_address: "Madurai Junction"
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["status"]).to eq("pending_payment")
      expect(json["data"]["razorpay_order"]["order_id"]).to be_present
    end

    it "returns 404 for unknown vehicle uuid" do
      post "/api/v1/bookings", headers: headers, params: {
        vehicle_id: "00000000-0000-0000-0000-000000000000",
        start_time: 2.hours.from_now.iso8601,
        end_time: 6.hours.from_now.iso8601
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns validation error on failed booking creation" do
      post "/api/v1/bookings", headers: headers, params: {
        vehicle_id: vehicle.uuid,
        start_time: 6.hours.from_now.iso8601,
        end_time: 2.hours.from_now.iso8601
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "POST /api/v1/bookings/:id/pay_advance" do
    let(:razorpay_secret) { "test_secret_for_spec" }
    
    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with("RAZORPAY_KEY_SECRET").and_return(razorpay_secret)
    end

    it "verifies payment and confirms booking" do
      booking = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle, status: :pending_payment) }

      signature = OpenSSL::HMAC.hexdigest("SHA256", razorpay_secret, "#{booking.razorpay_order_id}|pay_test_999")

      post "/api/v1/bookings/#{booking.uuid}/pay_advance", headers: headers, params: {
        razorpay_payment_id: "pay_test_999",
        razorpay_signature: signature
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["status"]).to eq("confirmed")
      expect(json["data"]["booking"]["payment_status"]).to eq("advance_paid")
    end

    it "returns 404 for unknown booking" do
      post "/api/v1/bookings/00000000-0000-0000-0000-000000000000/pay_advance", headers: headers, params: {
        razorpay_payment_id: "pay_123"
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on payment failure" do
      booking = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle, status: :confirmed) }

      post "/api/v1/bookings/#{booking.uuid}/pay_advance", headers: headers, params: {
        razorpay_payment_id: "pay_123"
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/bookings/:id/cancel" do
    it "cancels an active booking" do
      booking = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle, status: :confirmed) }

      patch "/api/v1/bookings/#{booking.uuid}/cancel", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["status"]).to eq("cancelled")
    end

    it "returns 404 for unknown booking" do
      patch "/api/v1/bookings/00000000-0000-0000-0000-000000000000/cancel", headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content if booking is completed" do
      booking = in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle, status: :completed) }

      patch "/api/v1/bookings/#{booking.uuid}/cancel", headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
