require "rails_helper"

RSpec.describe "Api::V1::DriverJobs", :tenant_schema, type: :request do
  let(:slug) { "job_tenant_#{SecureRandom.hex(4)}" }
  let(:plan) { create(:plan) }

  before do
    provision_tenant(slug)
    Apartment::Tenant.reset
    owner = Owner.find_by!(slug: slug)
    owner.active!
    create(:subscription, owner: owner, plan: plan, status: :active)
  end

  after { drop_tenant(slug) }

  let(:admin_user) do
    in_tenant(slug) { create(:user, role: :owner_admin) }
  end

  let(:driver_user) do
    in_tenant(slug) { create(:user, role: :driver) }
  end

  let(:customer_user) do
    in_tenant(slug) { create(:user, role: :customer) }
  end

  let(:vehicle) { in_tenant(slug) { create(:vehicle) } }
  let(:booking) { in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle, status: :confirmed) } }

  let(:admin_headers) do
    token = JwtService.encode_access(subject: admin_user.uuid, role: "owner_admin", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  let(:driver_headers) do
    token = JwtService.encode_access(subject: driver_user.uuid, role: "driver", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  describe "POST /api/v1/bookings/:id/assign_driver" do
    it "assigns driver to booking when requested by owner_admin" do
      post "/api/v1/bookings/#{booking.uuid}/assign_driver", headers: admin_headers, params: {
        driver_id: driver_user.uuid
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["driver"]["id"]).to eq(driver_user.uuid)
    end

    it "returns 404 for unknown booking or driver" do
      post "/api/v1/bookings/00000000-0000-0000-0000-000000000000/assign_driver", headers: admin_headers, params: {
        driver_id: driver_user.uuid
      }
      expect(response).to have_http_status(:not_found)

      post "/api/v1/bookings/#{booking.uuid}/assign_driver", headers: admin_headers, params: {
        driver_id: "00000000-0000-0000-0000-000000000000"
      }
      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on assignment failure" do
      in_tenant(slug) { booking.completed! }

      post "/api/v1/bookings/#{booking.uuid}/assign_driver", headers: admin_headers, params: {
        driver_id: driver_user.uuid
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "POST /api/v1/bookings/:id/start_job" do
    before { in_tenant(slug) { booking.update!(driver: driver_user) } }

    it "starts job execution with initial meter reading" do
      post "/api/v1/bookings/#{booking.uuid}/start_job", headers: driver_headers, params: {
        start_meter_reading: 1500.0
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["status"]).to eq("in_progress")
      expect(json["data"]["booking"]["start_meter_reading"].to_f).to eq(1500.0)
    end

    it "returns 404 for unknown booking" do
      post "/api/v1/bookings/00000000-0000-0000-0000-000000000000/start_job", headers: driver_headers, params: {
        start_meter_reading: 1500.0
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on invalid start job request" do
      post "/api/v1/bookings/#{booking.uuid}/start_job", headers: driver_headers, params: {
        start_meter_reading: -10
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "POST /api/v1/bookings/:id/finish_job" do
    before { in_tenant(slug) { booking.update!(driver: driver_user, status: :in_progress, start_meter_reading: 1500.0) } }

    it "completes job execution with final meter reading" do
      post "/api/v1/bookings/#{booking.uuid}/finish_job", headers: driver_headers, params: {
        end_meter_reading: 1550.0
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["booking"]["status"]).to eq("completed")
      expect(json["data"]["booking"]["end_meter_reading"].to_f).to eq(1550.0)
    end

    it "returns 404 for unknown booking" do
      post "/api/v1/bookings/00000000-0000-0000-0000-000000000000/finish_job", headers: driver_headers, params: {
        end_meter_reading: 1550.0
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on invalid finish job request" do
      post "/api/v1/bookings/#{booking.uuid}/finish_job", headers: driver_headers, params: {
        end_meter_reading: 1400.0
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
