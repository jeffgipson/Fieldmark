# frozen_string_literal: true

module Api
  module V1
    class InvitationsController < BaseController
      include UserProfileSerialization

      before_action :set_invitation, only: :destroy

      def index
        invitations = current_user.sent_invitations.order(created_at: :desc)
        invitations.each(&:mark_expired_if_needed!)
        render_success(invitations.map { |i| invitation_json(i) })
      end

      def create
        invitation = current_user.sent_invitations.build(invitation_params)
        if invitation.save
          FieldmarkMailer.invitation(invitation).deliver_later
          render_success(
            invitation_json(invitation).merge("email_sent" => true),
            status: :created
          )
        else
          render_errors(model_errors(invitation), status: :unprocessable_entity)
        end
      end

      def destroy
        if @invitation.accepted?
          return render_errors(
            [{ field: "base", message: "Cannot revoke an accepted invitation." }],
            status: :unprocessable_entity
          )
        end

        @invitation.update!(status: :revoked)
        render_success(invitation_json(@invitation))
      end

      private

      def invitation_params
        params.require(:invitation).permit(:email, :message)
      end

      def set_invitation
        @invitation = current_user.sent_invitations.find(params[:id])
      end
    end
  end
end
