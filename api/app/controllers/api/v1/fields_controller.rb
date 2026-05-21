# frozen_string_literal: true

module Api
  module V1
    class FieldsController < BaseController
      include FieldSerialization
      include EnforcesSubscription

      before_action :set_farm
      before_action :authorize_field_creation!, only: [:create]
      before_action :set_field, only: %i[show update destroy]

      def index
        fields = @farm.fields.includes(:farm).order(:name).page(params[:page]).per(params[:per_page] || 25)
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
        @farm = find_farm!
      end

      def set_field
        @field = @farm.fields.includes(:farm).find(params[:id])
      end

      def field_params
        raw = params.require(:field)
        permitted = raw.permit(
          :name, :acres, :soil_type, :primary_commodity, :description, :latitude, :longitude
        )
        if raw.key?(:boundary)
          permitted[:boundary] = json_param_to_hash(raw[:boundary])
        end
        if raw.key?(:location_meta)
          permitted[:location_meta] = json_param_to_hash(raw[:location_meta])
        end
        permitted
      end

    end
  end
end
