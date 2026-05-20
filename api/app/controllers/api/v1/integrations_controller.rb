# frozen_string_literal: true

module Api
  module V1
    class IntegrationsController < BaseController
      def index
        render_success(IntegrationsCatalogService.call)
      end
    end
  end
end
