# frozen_string_literal: true

module Api
  module V1
    class FieldRiskProfilesController < BaseController
      before_action :set_farm
      before_action :set_field

      def show
        profile = @field.field_risk_profile || @field.build_field_risk_profile
        render_success(risk_profile_json(profile))
      end

      def update
        profile = @field.field_risk_profile || @field.build_field_risk_profile
        if profile.update(risk_profile_params)
          render_success(risk_profile_json(profile.reload))
        else
          render_errors(model_errors(profile), status: :unprocessable_entity)
        end
      end

      private

      def set_farm
        @farm = find_farm!(params[:farm_id])
      end

      def set_field
        @field = @farm.fields.find(params[:field_id])
      end

      def risk_profile_params
        params.require(:field_risk_profile).permit(
          :flood_events_last_5_years, :drainage, :bottomland, :risk_notes
        )
      end

      def risk_profile_json(profile)
        scenario = @farm.scenarios.order(:name).find { |s| s.results.is_a?(Hash) && s.results["base_case"].present? }
        profile.as_json(only: %i[
          id field_id flood_events_last_5_years drainage bottomland risk_notes created_at updated_at
        ]).merge(
          risk_suggestion: FieldRiskSuggestionService.call(@field, scenario: scenario)
        )
      end
    end
  end
end
