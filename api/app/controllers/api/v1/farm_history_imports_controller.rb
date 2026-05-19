# frozen_string_literal: true

module Api
  module V1
    class FarmHistoryImportsController < BaseController
      include RescuesAi

      before_action :set_farm

      def create
        csv_text = extract_csv_text
        if csv_text.blank?
          return render_errors([{ field: "csv", message: "is required" }], status: :unprocessable_entity)
        end

        apply = !ActiveModel::Type::Boolean.new.cast(params[:preview])
        result = FarmHistoryCsvImportService.call(
          @farm,
          csv_text: csv_text,
          filename: uploaded_filename,
          apply: apply
        )
        render_success(result, status: :created)
      end

      private

      def set_farm
        @farm = find_farm!(params[:farm_id])
      end

      def extract_csv_text
        if params[:csv].present?
          return params[:csv]
        end

        file = params[:file]
        return nil unless file.respond_to?(:read)

        body = file.read
        body = body.force_encoding("UTF-8") unless body.encoding == Encoding::UTF_8
        body.scrub
      end

      def uploaded_filename
        file = params[:file]
        return file.original_filename if file.respond_to?(:original_filename)

        "upload.csv"
      end
    end
  end
end
