# frozen_string_literal: true

class HealthController < ApplicationController
  def show
    render json: { data: { status: "ok" }, meta: {}, errors: [] }
  end
end
