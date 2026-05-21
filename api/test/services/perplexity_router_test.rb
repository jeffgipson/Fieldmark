# frozen_string_literal: true

require "test_helper"

class PerplexityRouterTest < ActiveSupport::TestCase
  test "parse_response extracts content citations and search results" do
    data = {
      "choices" => [{ "message" => { "content" => "Missouri soil moisture is mixed." } }],
      "citations" => ["https://droughtmonitor.unl.edu/"],
      "search_results" => [{ "title" => "U.S. Drought Monitor", "url" => "https://droughtmonitor.unl.edu/" }]
    }

    result = PerplexityRouter.parse_response(data)
    assert_equal "Missouri soil moisture is mixed.", result[:content]
    assert_includes result[:citations], "https://droughtmonitor.unl.edu/"
    assert_equal "U.S. Drought Monitor", result[:search_results].first[:title]
  end
end
