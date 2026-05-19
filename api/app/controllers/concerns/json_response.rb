# frozen_string_literal: true

module JsonResponse
  extend ActiveSupport::Concern

  private

  def render_success(data, meta: {}, status: :ok)
    render json: { data: data, meta: meta, errors: [] }, status: status
  end

  def render_errors(errors, status: :unprocessable_entity)
    render json: { data: nil, meta: {}, errors: Array(errors) }, status: status
  end

  def model_errors(record)
    record.errors.map { |error| { field: error.attribute.to_s, message: error.full_message } }
  end
end
