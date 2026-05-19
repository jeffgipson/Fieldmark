# frozen_string_literal: true

module Api
  module V1
    class FieldDescriptionsController < BaseController
      include FieldSerialization
      include RescuesAi

      before_action :set_farm
      before_action :set_field

      def create
        description = FieldDescriptionGeneratorService.call(field: @field)
        if @field.update(description: description)
          render_success(field_json(@field))
        else
          render_errors(model_errors(@field), status: :unprocessable_entity)
        end
      end

      private

      def set_farm
        @farm = find_farm!
      end

      def set_field
        @field = @farm.fields.includes(:farm, :input_costs).find(params[:field_id])
      end

      def ai_failure_message
        "Could not reach the AI service. Check ANTHROPIC_API_KEY in api/.env and try again."
      end
    end
  end
end
