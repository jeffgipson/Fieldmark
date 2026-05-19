# frozen_string_literal: true

require "test_helper"

class ReportContentNormalizerTest < ActiveSupport::TestCase
  test "strips html and flattens hash list items" do
    result = ReportContentNormalizer.normalize(
      summary: "<p>Farm is <strong>solid</strong> at base case.</p>",
      key_findings: [{ "finding" => "Seed runs $12/ac above benchmark." }],
      recommendations: ["Review fertilizer quote"],
      risk_flags: [],
      lender_narrative: "Plain narrative."
    )

    assert_equal "Farm is solid at base case.", result[:summary]
    assert_equal ["Seed runs $12/ac above benchmark."], result[:key_findings]
  end

  test "unwraps json accidentally stored in summary" do
    blob = {
      summary: "Executive line.",
      key_findings: ["Finding one"],
      lender_narrative: "Narrative body."
    }.to_json

    result = ReportContentNormalizer.normalize(summary: blob)

    assert_equal "Executive line.", result[:summary]
    assert_equal ["Finding one"], result[:key_findings]
    assert_equal "Narrative body.", result[:lender_narrative]
  end
end
