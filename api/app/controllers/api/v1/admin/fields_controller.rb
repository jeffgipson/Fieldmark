# frozen_string_literal: true

module Api
  module V1
    module Admin
      class FieldsController < BaseController
        before_action :set_farm
        before_action :set_field, only: %i[show update destroy]

        def index
          fields = @farm.fields.order(:name).page(params[:page]).per(params[:per_page] || 25)
          render_success(fields.map { |f| field_json(f) }, meta: pagination_meta(fields))
        end

        def show
          render_success(field_json(@field))
        end

        def create
          field = @farm.fields.build(field_params)
          if field.save
            render_success(field_json(field), status: :created)
          else
            render_errors(model_errors(field), status: :unprocessable_entity)
          end
        end

        def update
          if @field.update(field_params)
            render_success(field_json(@field))
          else
            render_errors(model_errors(@field), status: :unprocessable_entity)
          end
        end

        def destroy
          @field.destroy!
          render_success({ id: @field.id })
        end

        private

        def set_farm
          @farm = Farm.find(params[:farm_id])
        end

        def set_field
          @field = @farm.fields.find(params[:id])
        end

        def field_params
          params.require(:field).permit(:name, :acres, :soil_type, :primary_commodity, :boundary)
        end

        def field_json(field)
          field.as_json(only: %i[id farm_id name acres soil_type primary_commodity created_at updated_at boundary])
        end
      end
    end
  end
end
