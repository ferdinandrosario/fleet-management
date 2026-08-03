require "rails_helper"

RSpec.describe "Api::V1::GpsTracking", :tenant_schema, type: :request do
  let(:slug) { "gps_tenant_#{SecureRandom.hex(4)}" }
  let(:plan) { create(:plan) }

  before do
    provision_tenant(slug)
    Apartment::Tenant.reset
    owner = Owner.find_by!(slug: slug)
    owner.active!
    create(:subscription, owner: owner, plan: plan, status: :active)
  end

  after { drop_tenant(slug) }

  let(:driver_user) do
    in_tenant(slug) { create(:user, role: :driver) }
  end

  let(:customer_user) do
    in_tenant(slug) { create(:user, role: :customer) }
  end

  let(:vehicle) { in_tenant(slug) { create(:vehicle) } }
  let(:booking) { in_tenant(slug) { create(:booking, customer: customer_user, driver: driver_user, vehicle: vehicle, status: :in_progress) } }

  let(:driver_headers) do
    token = JwtService.encode_access(subject: driver_user.uuid, role: "driver", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  let(:customer_headers) do
    token = JwtService.encode_access(subject: customer_user.uuid, role: "customer", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  describe "POST /api/v1/bookings/:id/gps_pings" do
    it "records a real-time GPS location ping from driver" do
      post "/api/v1/bookings/#{booking.uuid}/gps_pings", headers: driver_headers, params: {
        latitude: 9.9252,
        longitude: 78.1198,
        speed_kmh: 35.0
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["gps_ping"]["latitude"].to_f).to eq(9.9252)
    end

    it "returns 404 for unknown booking" do
      post "/api/v1/bookings/00000000-0000-0000-0000-000000000000/gps_pings", headers: driver_headers, params: {
        latitude: 9.9252,
        longitude: 78.1198
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on invalid ping" do
      post "/api/v1/bookings/#{booking.uuid}/gps_pings", headers: driver_headers, params: {
        latitude: 200.0,
        longitude: 78.1198
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /api/v1/bookings/:id/tracking" do
    it "fetches latest location and tracking trail for booking party" do
      in_tenant(slug) { create(:gps_ping, booking: booking, driver: driver_user, latitude: 9.9252, longitude: 78.1198) }

      get "/api/v1/bookings/#{booking.uuid}/tracking", headers: customer_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["latest_location"]["latitude"].to_f).to eq(9.9252)
      expect(json["data"]["trail"].size).to eq(1)
    end

    it "returns 404 for unknown booking" do
      get "/api/v1/bookings/00000000-0000-0000-0000-000000000000/tracking", headers: customer_headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
