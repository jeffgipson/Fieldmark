# frozen_string_literal: true

module FarmPrioritySerialization
  extend ActiveSupport::Concern

  private

  def priority_json(priority)
    priority.as_json(only: %i[id farm_id category note season_year status source position created_at updated_at]).merge(
      "category_label" => FarmPriority::CATEGORY_LABELS[priority.category],
      "dale_guidance" => FarmPriority::DALE_GUIDANCE[priority.category.to_sym]
    )
  end
end
