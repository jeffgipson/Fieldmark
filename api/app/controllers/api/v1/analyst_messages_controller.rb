# frozen_string_literal: true

module Api
  module V1
    class AnalystMessagesController < BaseController
      include RescuesAi

      before_action :set_conversation

      def create
        user_message = @conversation.analyst_messages.create!(
          role: :user,
          content: message_params[:content]
        )

        @conversation.update!(
          context_snapshot: ContextSnapshotBuilder.call(@conversation.farm, @conversation.scenario)
        )

        assistant_message = AnalystService.call(
          conversation: @conversation,
          user_message: user_message
        )

        render_success(
          {
            user_message: message_json(user_message),
            assistant_message: message_json(assistant_message)
          },
          status: :created
        )
      end

      private

      def set_conversation
        @conversation = AnalystConversation
                          .joins(:farm)
                          .merge(current_user_farms)
                          .find(params[:conversation_id])
      end

      def message_params
        params.require(:message).permit(:content)
      end

      def message_json(message)
        message.as_json(only: %i[id role content token_count created_at updated_at])
      end
    end
  end
end
