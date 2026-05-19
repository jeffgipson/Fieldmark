# frozen_string_literal: true

module Api
  module V1
    class FarmPrioritiesController < BaseController
      include FarmPrioritySerialization

      before_action :set_farm
      before_action :set_priority, only: %i[update destroy]

      def index
        priorities = @farm.farm_priorities.for_season(season_year_param).order(:position, :created_at)
        render_success(priorities.map { |p| priority_json(p) })
      end

      def create
        priority = @farm.farm_priorities.build(priority_params.merge(default_season_attrs))
        if priority.save
          render_success(priority_json(priority), status: :created)
        else
          render_errors(model_errors(priority), status: :unprocessable_entity)
        end
      end

      def update
        if @priority.update(priority_params)
          render_success(priority_json(@priority))
        else
          render_errors(model_errors(@priority), status: :unprocessable_entity)
        end
      end

      def destroy
        @priority.destroy!
        render_success({ id: @priority.id })
      end

      def sync
        items = sync_params[:priorities] || []
        if items.size > FarmPriority::MAX_ACTIVE_PER_SEASON
          return render_errors(
            [{ field: "priorities", message: "At most #{FarmPriority::MAX_ACTIVE_PER_SEASON} priorities allowed." }],
            status: :unprocessable_entity
          )
        end

        year = season_year_param
        ActiveRecord::Base.transaction do
          @farm.farm_priorities.active.for_season(year).find_each { |p| p.update!(status: :resolved) }
          items.each_with_index do |item, index|
            category = item[:category].presence || FarmPriority.infer_category_from_text(item[:note])
            @farm.farm_priorities.create!(
              category: category,
              note: item[:note],
              season_year: year,
              status: :active,
              source: item[:source] || :onboarding,
              position: index
            )
          end
        end

        priorities = @farm.farm_priorities.active_for_season(year)
        render_success(priorities.map { |p| priority_json(p) })
      end

      def from_message
        content = params.require(:message).permit(:content)[:content].to_s.strip
        if content.blank?
          return render_errors([{ field: "content", message: "Message content is required." }], status: :unprocessable_entity)
        end

        category = params.dig(:priority, :category).presence || FarmPriority.infer_category_from_text(content)
        priority = @farm.farm_priorities.build(
          category: category,
          note: content.truncate(FarmPriority::NOTE_MAX_LENGTH),
          season_year: season_year_param,
          status: :active,
          source: :dale_chat,
          position: next_position
        )

        if priority.save
          render_success(priority_json(priority), status: :created)
        else
          render_errors(model_errors(priority), status: :unprocessable_entity)
        end
      end

      private

      def set_farm
        @farm = find_farm!(params[:farm_id])
      end

      def set_priority
        @priority = @farm.farm_priorities.find(params[:id])
      end

      def season_year_param
        (params[:season_year] || CurrentSeason.year).to_i
      end

      def default_season_attrs
        { season_year: season_year_param, position: next_position }
      end

      def next_position
        @farm.farm_priorities.active.for_season(season_year_param).maximum(:position).to_i + 1
      end

      def priority_params
        params.require(:priority).permit(:category, :note, :status, :source, :position, :season_year)
      end

      def sync_params
        params.permit(priorities: %i[category note source])
      end
    end
  end
end
