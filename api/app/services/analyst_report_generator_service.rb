# frozen_string_literal: true

class AnalystReportGeneratorService
  REPORT_PROMPT = <<~PROMPT.squish
    Generate a lender-ready financial summary for this farm scenario.
    Use plain Midwest language and specific dollar amounts. Include downside risk.
    Do not recommend vendors. Output plain text only — no HTML tags, no markdown,
    and do not paste the farm context JSON back into the report. key_findings,
    recommendations, and risk_flags must be simple string sentences, not objects.
    When regional_risk.live is true in the farm context, include a short Regional
    conditions paragraph in the lender_narrative citing regional_risk sources by name;
    do not invent conditions if live is false.
  PROMPT

  def self.call(scenario)
    new(scenario).call
  end

  def initialize(scenario)
    @scenario = scenario
  end

  def call
    context = ContextSnapshotBuilder.call(@scenario.farm, @scenario)
    payload = Ai.json(
      system: AnalystService::SYSTEM_PROMPT,
      keys: %i[summary key_findings recommendations risk_flags lender_narrative],
      defaults: { key_findings: [], recommendations: [], risk_flags: [] },
      messages: [
        { role: "user", content: "Farm context:\n#{context.to_json}" },
        { role: "user", content: REPORT_PROMPT }
      ],
      max_tokens: 4096
    )

    ReportContentNormalizer.normalize(payload).merge(generated_at: Time.current)
  end
end
