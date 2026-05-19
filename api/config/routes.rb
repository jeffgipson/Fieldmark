# frozen_string_literal: true

Rails.application.routes.draw do
  get "/api/health", to: "health#show"

  namespace :api do
    namespace :v1 do
      devise_for :users,
                 path: "auth",
                 path_names: {
                   sign_in: "login",
                   sign_out: "logout",
                   registration: "register"
                 },
                 controllers: {
                   sessions: "api/v1/users/sessions",
                   registrations: "api/v1/users/registrations",
                   passwords: "api/v1/users/passwords"
                 }
      post "auth/demo", to: "auth/demo#create"

      resources :farms do
        member do
          get :yield_context
          get :benchmark_trends
          get :summary
          get :underwriting
        end
        resource :cover_photo, only: %i[show update destroy], controller: "farm_cover_photos"
        resources :fields do
          resource :cover_photo, only: %i[show update destroy], controller: "field_cover_photos"
          resource :description, only: :create, controller: "field_descriptions"
          resource :risk_profile, only: %i[show update], controller: "field_risk_profiles"
        end
        resources :scenarios do
          member do
            post :calculate
            post :compare
            get :forecast
          end
        end
        resources :season_snapshots, controller: "farm_season_snapshots", only: %i[index create update destroy]
        resources :history_imports, controller: "farm_history_imports", only: %i[create]
        resources :priorities, controller: "farm_priorities", only: %i[index create update destroy] do
          collection do
            put :sync, action: :sync
            post :from_message, action: :from_message
          end
        end
      end

      resources :fields, only: [] do
        resources :input_costs, only: %i[index create update destroy]
      end

      resources :scenarios, only: [] do
        get :report, to: "analyst_reports#show"
        post :report, to: "analyst_reports#create"
        post "report/email", to: "analyst_reports#email"
        resource :decision, only: %i[create update]
      end

      resources :conversations, controller: "analyst_conversations", only: %i[create show] do
        resources :messages, controller: "analyst_messages", only: %i[create]
      end

      get "benchmarks", to: "benchmarks#index"
      resources :vendors, only: %i[index show]
      resources :vendor_contacts, only: %i[index create destroy] do
        collection do
          delete "by_vendor/:vendor_id", action: :destroy_by_vendor, as: :by_vendor
        end
      end
      get "vendor_recommendations", to: "vendor_recommendations#index"

      namespace :admin do
        get "stats", to: "stats#show"

        resources :users, only: %i[index show create update destroy]
        resources :farms, only: %i[index show create update destroy] do
          resources :fields, only: %i[index show create update destroy]
          resources :scenarios, only: %i[index show create update destroy] do
            member do
              post :calculate
              post :compare
            end
          end
        end
        resources :fields, only: [] do
          resources :input_costs, only: %i[index create update destroy]
        end
        resources :benchmark_regions, only: %i[index show update]
        resources :vendors
      end
      resource :billing, only: [:show], controller: "billing" do
        get :plans, on: :collection
        post :checkout
        post :portal
        post "webhooks/stripe", action: :stripe_webhook, on: :collection
      end

      resource :profile, only: %i[show update], controller: "profiles" do
        patch :credentials, on: :member
      end
      resource :avatar, only: %i[show update destroy], controller: "user_avatars"
      resources :invitations, only: %i[index create destroy]

      get "map_config", to: "map_config#show"

      scope :locations, controller: "locations" do
        post :lookup, action: :lookup
        get :search, action: :search
        get :boundaries, action: :boundaries
      end
    end
  end
end
