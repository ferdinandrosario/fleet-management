Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Versioned JSON API. Every application endpoint lives under /api/v1.
  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"

      # Auth (paths under /auth/* so the rack-attack throttles match), but the
      # controllers stay in Api::V1 (no Auth module) via `scope`.
      scope :auth do
        post "register", to: "registrations#create"
        post "otp", to: "otps#create"
        post "otp/verify", to: "otps#verify"
        post "login", to: "sessions#create"
        post "refresh", to: "sessions#refresh"
        delete "logout", to: "profile#logout"
      end

      # The authenticated user's own account.
      get "me", to: "profile#show"
      patch "me", to: "profile#update"
    end
  end
end
