# frozen_string_literal: true

module Api
  module V1
    class DecisionsController < BaseController
      before_action :set_scenario

      def create
        if @scenario.decision.present?
          render_errors(
            [{ field: "decision", message: "Decision already exists for this scenario." }],
            status: :unprocessable_entity
          )
          return
        end

        decision = @scenario.build_decision(decision_params)
        if decision.save
          render_success(decision_json(decision), status: :created)
        else
          render_errors(model_errors(decision), status: :unprocessable_entity)
        end
      end

      def update
        decision = @scenario.decision
        unless decision
          render_errors(
            [{ field: "decision", message: "No decision found for this scenario." }],
            status: :not_found
          )
          return
        end

        if decision.update(decision_params)
          render_success(decision_json(decision))
        else
          render_errors(model_errors(decision), status: :unprocessable_entity)
        end
      end

      private

      def set_scenario
        @scenario = find_scenario!
      end

      def decision_params
        permitted = params.require(:decision).permit(
          :decision_type, :notes, :decided_at, :actual_outcome, :vendor_id, :vendor_category, :vendor_contact_notes,
          field_notes: %i[field_id stance note] # array of { field_id, stance, note }
        )
        permitted[:decided_at] ||= Time.current
        permitted
      end

      def decision_json(decision)
        decision.as_json(only: %i[
          id scenario_id decision_type notes field_notes decided_at actual_outcome vendor_id vendor_category vendor_contact_notes created_at updated_at
        ])
      end
    end
  end
end
