require "rails_helper"

RSpec.describe "Api::V1::DriverPayrolls", :tenant_schema, type: :request do
  let(:slug) { "pay_req_#{SecureRandom.hex(4)}" }
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

  let(:admin_user) do
    in_tenant(slug) { create(:user, role: :owner_admin) }
  end

  let(:driver_headers) do
    token = JwtService.encode_access(subject: driver_user.uuid, role: "driver", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  let(:admin_headers) do
    token = JwtService.encode_access(subject: admin_user.uuid, role: "owner_admin", tenant: slug)
    { "Authorization" => "Bearer #{token}", "X-Tenant" => slug }
  end

  describe "GET /api/v1/driver_payrolls" do
    it "lists payroll settlement records" do
      in_tenant(slug) { create(:driver_payroll, driver: driver_user) }

      get "/api/v1/driver_payrolls", headers: driver_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["payrolls"].size).to eq(1)
    end
  end

  describe "POST /api/v1/driver_payrolls/calculate" do
    it "calculates payroll for specified driver and period" do
      post "/api/v1/driver_payrolls/calculate", headers: admin_headers, params: {
        driver_id: driver_user.uuid,
        period_start: 7.days.ago.to_date,
        period_end: Date.current,
        bonus_paise: 10000,
        deductions_paise: 0
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["payroll"]["driver_id"]).to eq(driver_user.uuid)
    end

    it "returns 404 for unknown driver" do
      post "/api/v1/driver_payrolls/calculate", headers: admin_headers, params: {
        driver_id: "00000000-0000-0000-0000-000000000000",
        period_start: Date.current,
        period_end: Date.current
      }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content on invalid calculation params" do
      post "/api/v1/driver_payrolls/calculate", headers: admin_headers, params: {
        driver_id: driver_user.uuid,
        period_start: Date.current,
        period_end: Date.current - 2.days
      }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/driver_payrolls/:id/pay" do
    let(:payroll) { in_tenant(slug) { create(:driver_payroll, driver: driver_user, status: :draft) } }

    it "marks payroll settlement as paid" do
      patch "/api/v1/driver_payrolls/#{payroll.uuid}/pay", headers: admin_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["payroll"]["status"]).to eq("paid")
    end

    it "returns 404 for unknown payroll" do
      patch "/api/v1/driver_payrolls/00000000-0000-0000-0000-000000000000/pay", headers: admin_headers

      expect(response).to have_http_status(:not_found)
    end

    it "returns unprocessable_content if payroll payment update fails" do
      in_tenant(slug) { payroll.update_columns(period_end: payroll.period_start - 1.day) }

      patch "/api/v1/driver_payrolls/#{payroll.uuid}/pay", headers: admin_headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
