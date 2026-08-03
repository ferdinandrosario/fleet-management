require "rails_helper"

RSpec.describe "Api::V1::Discovery", :tenant_schema, type: :request do
  let(:slug) { "disc_tenant_#{SecureRandom.hex(4)}" }
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

  describe "GET /api/v1/discovery/vehicles" do
    it "searches vehicles with location proximity and filters" do
      v1 = in_tenant(slug) { create(:vehicle, latitude: 9.9252, longitude: 78.1198, category: :jcb) }

      get "/api/v1/discovery/vehicles", headers: headers, params: {
        latitude: 9.9252,
        longitude: 78.1198,
        radius_km: 20.0,
        category: "jcb"
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["vehicles"].size).to eq(1)
      expect(json["data"]["vehicles"].first["id"]).to eq(v1.uuid)
      expect(json["data"]["vehicles"].first["distance_km"]).to be_present
    end
  end
end
