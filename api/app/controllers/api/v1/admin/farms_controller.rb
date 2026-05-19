# frozen_string_literal: true

module Api
  module V1
    module Admin
      class FarmsController < BaseController
        before_action :set_farm, only: %i[show update destroy]
        before_action :set_user, only: %i[create]

        def index
          farms = Farm.order(:name).page(params[:page]).per(params[:per_page] || 25)
          if params[:user_id].present?
            farms = farms.where(user_id: params[:user_id])
          end
          render_success(farms.map { |f| farm_json(f) }, meta: pagination_meta(farms))
        end

        def show
          render_success(farm_json(@farm))
        end

        def create
          farm = @user.farms.build(farm_params)
          if farm.save
            render_success(farm_json(farm), status: :created)
          else
            render_errors(model_errors(farm), status: :unprocessable_entity)
          end
        end

        def update
          if @farm.update(farm_params)
            render_success(farm_json(@farm))
          else
            render_errors(model_errors(@farm), status: :unprocessable_entity)
          end
        end

        def destroy
          @farm.destroy!
          render_success({ id: @farm.id })
        end

        private

        def set_user
          @user = User.find(params[:user_id]) if params[:user_id].present?
          return if @user

          render_errors([{ field: "user_id", message: "is required" }], status: :unprocessable_entity)
        end

        def set_farm
          @farm = Farm.find(params[:id])
        end

        def farm_params
          params.require(:farm).permit(:name, :total_acres, :county, :region, :primary_commodity, :user_id)
        end

        def farm_json(farm)
          farm.as_json(only: %i[id user_id name total_acres county region primary_commodity created_at updated_at]).merge(
            user: farm.user.as_json(only: %i[id email first_name last_name])
          )
        end
      end
    end
  end
end
