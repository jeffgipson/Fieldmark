# frozen_string_literal: true

module Api
  module V1
    class VendorsController < BaseController
      include VendorJson

      def index
        scope = Vendor.active.for_county(county_param).for_region(region_param)
        scope = scope.for_category(params[:category]) if params[:category].present?
        vendors = scope.ordered_for_display.page(params[:page]).per(params[:per_page] || 25)
        ids = favorited_vendor_ids
        render_success(
          vendors.map { |v| vendor_json(v, favorited: ids.include?(v.id)) },
          meta: pagination_meta(vendors)
        )
      end

      def show
        vendor = find_vendor!(params[:id])
        unless vendor.profile_page?
          return render_errors(
            [{ field: "vendor", message: "Profile is available for partner listings only." }],
            status: :not_found
          )
        end

        render_success(
          vendor_profile_json(vendor, favorited: favorited_vendor_ids.include?(vendor.id))
        )
      rescue ActiveRecord::RecordNotFound
        render_errors([{ field: "vendor", message: "Vendor not found." }], status: :not_found)
      end

      private

      def county_param
        params[:county].presence || current_user.farms.order(:id).first&.county
      end

      def region_param
        params[:region].presence || current_user.farms.order(:id).first&.region
      end

      def find_vendor!(id)
        Vendor.active.find_by(slug: id) || Vendor.active.find(id)
      end
    end
  end
end
