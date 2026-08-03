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

      # Super admin platform operations (Session 4).
      namespace :super_admin do
        post "login", to: "sessions#create"
        resources :owners, only: [ :index, :show, :create ] do
          member do
            patch :status, to: "owners#update_status"
          end
        end
        resources :plans, only: [ :index, :show, :create, :update ]
        resources :subscriptions, only: [ :show, :update ]
      end

      # Vehicles, Availability, Pricing Rules & Reviews (Session 5 & 8).
      resources :vehicles, only: [ :index, :show, :create, :update, :destroy ] do
        member do
          get :quote
          get :reviews, to: "reviews#vehicle_reviews"
        end
        resources :availabilities, controller: "vehicle_availabilities", only: [ :index, :create, :destroy ]
        resources :pricing_rules, only: [ :index, :create, :destroy ]
      end

      # Discovery & Search (Session 6).
      get "discovery/vehicles", to: "discovery#vehicles"

      # Bookings, Payments, Driver Execution, GPS & Reviews (Session 6, 7 & 8).
      resources :bookings, only: [ :index, :show, :create ] do
        member do
          post :pay_advance
          patch :cancel

          # Session 7 driver work execution
          post :assign_driver, to: "driver_jobs#assign_driver"
          post :start_job, to: "driver_jobs#start_job"
          post :finish_job, to: "driver_jobs#finish_job"

          # Session 7 real-time GPS telemetry tracking
          post :gps_pings, to: "gps_tracking#create"
          get :tracking, to: "gps_tracking#show"

          # Session 8 reviews & completion proof photos
          post :review, to: "reviews#create"
        end
      end

      # Driver Leave Management & Payroll Settlement (Session 9).
      resources :driver_leaves, only: [ :index, :create ] do
        member do
          patch :status, to: "driver_leaves#update_status"
        end
      end

      resources :driver_payrolls, only: [ :index ] do
        collection do
          post :calculate
        end
        member do
          patch :pay
        end
      end
    end
  end
end
