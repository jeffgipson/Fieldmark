# frozen_string_literal: true

module Api
  module V1
    class FarmSeasonSnapshotsController < BaseController
      before_action :set_farm
      before_action :set_snapshot, only: %i[update destroy]

      def index
        snapshots = @farm.farm_season_snapshots.order(season_year: :desc)
        render_success(snapshots.map { |s| snapshot_json(s) })
      end

      def create
        snapshot = @farm.farm_season_snapshots.build(snapshot_params)
        snapshot.source ||= :farmer_entered
        if snapshot.save
          render_success(snapshot_json(snapshot), status: :created)
        else
          render_errors(model_errors(snapshot), status: :unprocessable_entity)
        end
      end

      def update
        if @snapshot.update(snapshot_params)
          render_success(snapshot_json(@snapshot))
        else
          render_errors(model_errors(@snapshot), status: :unprocessable_entity)
        end
      end

      def destroy
        @snapshot.destroy!
        render_success({ id: @snapshot.id })
      end

      private

      def set_farm
        @farm = find_farm!(params[:farm_id])
      end

      def set_snapshot
        @snapshot = @farm.farm_season_snapshots.find(params[:id])
      end

      def snapshot_params
        params.require(:farm_season_snapshot).permit(
          :season_year, :actual_yield, :actual_price, :actual_total_operating_per_acre, :notes, :source
        )
      end

      def snapshot_json(snapshot)
        snapshot.as_json(only: %i[
          id farm_id season_year actual_yield actual_price actual_total_operating_per_acre notes source
          created_at updated_at
        ])
      end
    end
  end
end
