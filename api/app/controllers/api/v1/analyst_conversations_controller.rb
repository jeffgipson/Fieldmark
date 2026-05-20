# frozen_string_literal: true

module Api
  module V1
    class AnalystConversationsController < BaseController
      before_action :set_conversation, only: :show

      def create
        farm = find_farm!(conversation_params[:farm_id])
        scenario = find_scenario!(conversation_params[:scenario_id]) if conversation_params[:scenario_id].present?

        conversation = farm.analyst_conversations.build(
          scenario: scenario,
          context_snapshot: ContextSnapshotBuilder.call(
            farm,
            scenario,
            client_path: conversation_params[:client_path]
          )
        )

        if conversation.save
          render_success(conversation_json(conversation), status: :created)
        else
          render_errors(model_errors(conversation), status: :unprocessable_entity)
        end
      end

      def show
        render_success(conversation_json(@conversation, include_messages: true))
      end

      private

      def set_conversation
        @conversation = AnalystConversation
                          .joins(:farm)
                          .merge(current_user_farms)
                          .find(params[:id])
      end

      def conversation_params
        params.require(:conversation).permit(:farm_id, :scenario_id, :client_path)
      end

      def conversation_json(conversation, include_messages: false)
        data = conversation.as_json(only: %i[
          id farm_id scenario_id context_snapshot created_at updated_at
        ])
        return data unless include_messages

        data.merge(
          messages: conversation.analyst_messages.order(:created_at).map do |message|
            message.as_json(only: %i[id role content token_count created_at updated_at])
          end
        )
      end
    end
  end
end
