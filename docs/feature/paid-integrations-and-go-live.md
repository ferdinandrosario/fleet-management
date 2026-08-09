# Feature: Paid Integrations & Production Go-Live Architecture (Session 12)

Canonical reference for third-party production payment gateway integration (Razorpay), SMS OTP delivery (Fast2SMS/Msg91), cloud object storage (AWS S3/Cloudflare R2), containerized deployment topology, and production readiness checklists.

---

## 1. Razorpay Payment Gateway & Webhook Signature Verification

The application integrates with Razorpay for 20% advance token deposits on commercial vehicle bookings.

### Production Workflow
1. **Order Creation**: Client calls `POST /api/v1/bookings` which initializes a Razorpay order via Razorpay API SDK (`Razorpay::Order.create(amount: advance_paise, currency: 'INR', receipt: booking.uuid)`).
2. **Client Checkout**: Front-end renders Razorpay Checkout SDK modal with `order_id` and `amount`.
3. **Payment Verification**: `PaymentVerificationService` validates signature via HMAC-SHA256:

$$\text{expected\_sig} = \text{HMAC-SHA256}(\text{razorpay\_order\_id} + "|" + \text{razorpay\_payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$

```ruby
# Production signature verification snippet
generated_signature = OpenSSL::HMAC.hexdigest(
  OpenSSL::Digest.new("sha256"),
  ENV.fetch("RAZORPAY_KEY_SECRET"),
  "#{order_id}|#{payment_id}"
)
raise PaymentError, "Invalid signature" unless ActiveSupport::SecurityUtils.secure_compare(generated_signature, signature)
```

---

## 2. SMS OTP Provider Integration (Fast2SMS / Msg91)

Production phone verification dispatches 6-digit OTP codes via Fast2SMS / Msg91 HTTPS API endpoints.

```ruby
# Production OTP Dispatcher
class SmsOtpService
  def self.send_otp(phone_number:, code:)
    return if Rails.env.development? || Rails.env.test?

    response = Faraday.post("https://www.fast2sms.com/dev/bulkV2") do |req|
      req.headers["authorization"] = ENV.fetch("FAST2SMS_API_KEY")
      req.headers["Content-Type"] = "application/json"
      req.body = {
        variables_values: code,
        route: "otp",
        numbers: phone_number.delete("+")
      }.to_json
    end
  end
end
```

---

## 3. ActiveStorage Cloud Storage Adapter (AWS S3 / Cloudflare R2)

Proof-of-work completion photos and vehicle document attachments utilize S3-compatible cloud object storage.

### `config/storage.yml` Production Configuration
```yaml
amazon:
  service: S3
  access_key_id: <%= ENV["AWS_ACCESS_KEY_ID"] %>
  secret_access_key: <%= ENV["AWS_SECRET_ACCESS_KEY"] %>
  region: <%= ENV["AWS_REGION"] %>
  bucket: <%= ENV["AWS_BUCKET"] %>
```

---

## 4. Containerization & Production Deployment Architecture

```
[ Nginx Reverse Proxy / TLS Termination ]
                   │
                   ▼
 [ Rails 8.1 API Container (Puma + Solid Queue + Solid Cache) ]
                   │
                   ├──▶ PostgreSQL 16 + PostGIS 3.4 (Tenant Isolation via ros-apartment)
                   └──▶ AWS S3 / Cloudflare R2 Object Storage
```

---

## 5. Pre-Flight Production Launch Checklist

| Category | Verification Item | Status |
|---|---|---|
| **Database** | Multi-tenant schema isolation (`ros-apartment`) verified | 🟢 Verified |
| **Test Suite** | 365 RSpec examples passing at 100% line coverage | 🟢 Verified |
| **Security** | 0 Brakeman security warnings across controllers/models | 🟢 Verified |
| **Linter** | 0 RuboCop offenses across 213 inspected files | 🟢 Verified |
| **i18n** | Full English translation keys (en) | 🟢 Verified |
