require "rails_helper"

# ApplicationController has no routes of its own, so it's exercised through an
# anonymous subclass with throwaway routes — the standard way to test the base
# controller's shared behavior (envelopes, Pundit rescue, locale resolution).
RSpec.describe ApplicationController, type: :controller do
  controller do
    def ok = render_success(data: { value: 1 })
    def made = render_success(data: { id: 9 }, status: :created)
    def boom = raise(Pundit::NotAuthorizedError)

    def invalid
      render_error(
        code: "validation_failed",
        message: I18n.t("errors.validation_failed"),
        status: :unprocessable_content,
        fields: { name: [ "is required" ] }
      )
    end

    def locale = render_success(data: { locale: I18n.locale.to_s })
  end

  before do
    routes.draw do
      get "ok" => "anonymous#ok"
      get "made" => "anonymous#made"
      get "boom" => "anonymous#boom"
      get "invalid" => "anonymous#invalid"
      get "locale" => "anonymous#locale"
    end
  end

  describe "#render_success" do
    it "wraps data in the success envelope" do
      get :ok
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq(
        "status" => "success", "data" => { "value" => 1 }, "error" => nil
      )
    end

    it "honors a custom status" do
      get :made
      expect(response).to have_http_status(:created)
    end
  end

  describe "#render_error" do
    it "wraps validation errors with per-field messages" do
      get :invalid
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body).to eq(
        "status" => "error",
        "data" => nil,
        "error" => {
          "code" => "validation_failed",
          "message" => "Validation failed.",
          "fields" => { "name" => [ "is required" ] }
        }
      )
    end
  end

  describe "Pundit::NotAuthorizedError" do
    it "is rescued into a 403 forbidden envelope (no fields)" do
      get :boom
      expect(response).to have_http_status(:forbidden)
      expect(response.parsed_body["error"]).to eq(
        "code" => "forbidden",
        "message" => "You are not authorized to perform this action."
      )
    end
  end

  describe "locale resolution" do
    it "defaults to en when no Accept-Language is sent" do
      get :locale
      expect(response.parsed_body["data"]["locale"]).to eq("en")
    end

    it "selects a supported locale from Accept-Language" do
      request.headers["Accept-Language"] = "hi"
      get :locale
      expect(response.parsed_body["data"]["locale"]).to eq("hi")
    end

    it "drops the region subtag (hi-IN -> hi)" do
      request.headers["Accept-Language"] = "hi-IN,en;q=0.9"
      get :locale
      expect(response.parsed_body["data"]["locale"]).to eq("hi")
    end

    it "falls back to en for an unsupported language" do
      request.headers["Accept-Language"] = "fr-FR"
      get :locale
      expect(response.parsed_body["data"]["locale"]).to eq("en")
    end
  end
end
