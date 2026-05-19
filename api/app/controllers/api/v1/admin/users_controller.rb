# frozen_string_literal: true

module Api
  module V1
    module Admin
      class UsersController < BaseController
        before_action :set_user, only: %i[show update destroy]

        def index
          users = User.order(:email).page(params[:page]).per(params[:per_page] || 25)
          if params[:email].present?
            users = users.where("email ILIKE ?", "%#{params[:email]}%")
          end
          if params[:role].present?
            users = users.where(role: params[:role])
          end
          render_success(users.map { |u| user_json(u) }, meta: pagination_meta(users))
        end

        def show
          render_success(user_json(@user))
        end

        def create
          # Note: This creates a user without a password, they will need to use password reset flow.
          user = User.new(user_params)
          if user.save
            render_success(user_json(user), status: :created)
          else
            render_errors(model_errors(user), status: :unprocessable_entity)
          end
        end

        def update
          if @user.update(user_params)
            render_success(user_json(@user))
          else
            render_errors(model_errors(@user), status: :unprocessable_entity)
          end
        end

        def destroy
          # Add logic to prevent deleting last admin or self
          if @user.admin? && User.admin.count == 1
            return render_errors([{ field: "base", message: "Cannot delete last admin." }], status: :forbidden)
          end
          if @user == current_user && User.admin.count == 1
            return render_errors([{ field: "base", message: "Cannot delete self as last admin." }], status: :forbidden)
          end

          @user.destroy!
          render_success({ id: @user.id })
        end

        private

        def set_user
          @user = User.find(params[:id])
        end

        def user_params
          params.require(:user).permit(:first_name, :last_name, :email, :role)
        end

        def user_json(user)
          user.as_json(only: %i[id email first_name last_name role created_at updated_at]).merge(
            farms_count: user.farms.count
          )
        end
      end
    end
  end
end
