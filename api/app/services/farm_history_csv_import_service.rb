# frozen_string_literal: true

class FarmHistoryCsvImportService
  def self.call(farm, csv_text:, filename: nil, apply: true)
    new(farm, csv_text:, filename:, apply:).call
  end

  def initialize(farm, csv_text:, filename:, apply:)
    @farm = farm
    @csv_text = csv_text
    @filename = filename
    @apply = apply
  end

  def call
    import = @farm.farm_history_imports.create!(
      filename: @filename,
      raw_csv: @csv_text,
      status: :parsing
    )

    parsed = FarmHistoryCsvParseService.call(@farm, csv_text: @csv_text)
    import.update!(status: :parsed, parsed_payload: parsed)

    return preview_result(import, parsed) unless @apply

    applied = FarmHistoryCsvApplyService.call(@farm, parsed: parsed)
    import.update!(status: :applied, applied_result: applied)
    applied.merge(import_id: import.id, status: "applied")
  rescue StandardError => e
    import&.update!(status: :failed, error_message: e.message) if import&.persisted?
    raise
  end

  private

  def preview_result(import, parsed)
    parsed.merge(
      import_id: import.id,
      status: "parsed",
      seasons_applied: 0,
      costs_applied: 0,
      snapshots: []
    )
  end
end
