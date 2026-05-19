# frozen_string_literal: true

module Api
  module V1
    module Admin
      class VendorsController < BaseController
        include VendorJson

        before_action :set_vendor, only: %i[show update destroy]

        def index
          vendors = Vendor.order(:name).page(params[:page]).per(params[:per_page] || 50)
          render_success(vendors.map { |v| vendor_json(v, admin: true) }, meta: pagination_meta(vendors))
        end

        def show
          render_success(vendor_json(@vendor, admin: true))
        end

        def create
          vendor = Vendor.new(vendor_params)
          if vendor.save
            render_success(vendor_json(vendor, admin: true), status: :created)
          else
            render_errors(model_errors(vendor), status: :unprocessable_entity)
          end
        end

        def update
          if @vendor.update(vendor_params)
            render_success(vendor_json(@vendor, admin: true))
          else
            render_errors(model_errors(@vendor), status: :unprocessable_entity)
          end
        end

        def destroy
          @vendor.destroy!
          render_success({ id: @vendor.id })
        end

        private

        def set_vendor
          @vendor = Vendor.find(params[:id])
        end

        def vendor_params
          params.require(:vendor).permit(
            :name, :slug, :category, :description, :website, :phone, :email,
            :street_address, :city, :state, :region, :serves_statewide,
            :listing_tier, :sponsored, :featured_until, :active,
            :billing_notes, :monthly_listing_cents,
            :profile_summary, :latitude, :longitude,
            counties: [], offerings: []
          )
        end
      end
    end
  end
end
