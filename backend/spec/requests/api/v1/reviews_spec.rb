require "rails_helper"

RSpec.describe "Api::V1::Reviews", :tenant_schema, type: :request do
  let(:slug) { "rev_tenant_#{SecureRandom.hex(4)}" }
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
    in_tenant(slug) { create(:user, role: :customer) }
  end

  let(:vehicle) { in_tenant(slug) { create(:vehicle) } }
  let(:booking) { in_tenant(slug) { create(:booking, customer: customer_user, vehicle: vehicle, status: :completed) } }

  let(:customer_headers) do
    token = JwtService.encode_access(subject: customer_user.uuid, role: "customer", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  describe "POST /api/v1/bookings/:id/review" do
    it "submits a review and proof photo for completed booking" do
      post "/api/v1/bookings/#{booking.uuid}/review", headers: customer_headers, params: {
        rating: 5,
        comment: "Excellent service!",
        completion_photo_url: "https://cdn.example.com/photo.jpg"
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["review"]["rating"]).to eq(5)
    end

    it "returns 404 for unknown booking" do
      post "/api/v1/bookings/00000000-0000-0000-0000-000000000000/review", headers: customer_headers, params: {
        rating: 5
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on invalid review submission" do
      post "/api/v1/bookings/#{booking.uuid}/review", headers: customer_headers, params: {
        rating: 10
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /api/v1/vehicles/:id/reviews" do
    it "lists reviews and rating statistics for vehicle" do
      in_tenant(slug) { create(:review, booking: booking, vehicle: vehicle, customer: customer_user, rating: 5) }
      in_tenant(slug) { vehicle.update_rating_stats! }

      get "/api/v1/vehicles/#{vehicle.uuid}/reviews", headers: customer_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["reviews"].size).to eq(1)
      expect(json["data"]["average_rating"].to_f).to eq(5.0)
    end

    it "returns 404 for unknown vehicle" do
      get "/api/v1/vehicles/00000000-0000-0000-0000-000000000000/reviews", headers: customer_headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
