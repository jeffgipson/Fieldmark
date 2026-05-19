#!/usr/bin/env python3
"""Restore missing api/ files from agent transcripts, .keep stubs, and Rails scaffold."""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "api"
MISSING_FILE = ROOT / "_api_restore_missing.txt"
SCAFFOLD = Path("/tmp/fm_api_scaffold")
TRANSCRIPTS = Path(
    "/Users/jeffgipson/.cursor/projects/Users-jeffgipson-Projects-Fieldmark/agent-transcripts"
)


def load_missing() -> list[str]:
    return [
        line.strip()
        for line in MISSING_FILE.read_text().splitlines()
        if line.strip()
    ]


def extract_from_transcripts(missing_set: set[str]) -> dict[str, str]:
    found: dict[str, str] = {}
    for jf in sorted(TRANSCRIPTS.rglob("*.jsonl")):
        for line in jf.read_text(errors="replace").splitlines():
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            for part in obj.get("message", {}).get("content", []):
                if part.get("type") != "tool_use":
                    continue
                inp = part.get("input", {})
                path = inp.get("path", "")
                if "/Fieldmark/api/" in path:
                    rel = "api/" + path.split("/Fieldmark/api/", 1)[1]
                elif path.startswith("api/"):
                    rel = path
                else:
                    continue
                if rel not in missing_set:
                    continue
                if part.get("name") == "Write":
                    content = inp.get("contents")
                    if content is not None:
                        found[rel] = content
                elif part.get("name") == "StrReplace" and rel in found:
                    old, new = inp.get("old_string"), inp.get("new_string")
                    if old and new and old in found[rel]:
                        found[rel] = found[rel].replace(old, new, 1)
    return found


def write_file(rel: str, content: str) -> None:
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content, encoding="utf-8")


def copy_scaffold(rel: str) -> bool:
    if not rel.startswith("api/"):
        return False
    src = SCAFFOLD / rel.removeprefix("api/")
    if not src.is_file():
        return False
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return True


MIGRATIONS: dict[str, str] = {
    "api/db/migrate/20260519012432_create_users.rb": """# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.integer :role, null: false, default: 0
      t.string :jti, null: false

      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :jti, unique: true
    add_index :users, :role
  end
end
""",
    "api/db/migrate/20260519012449_create_jwt_denylists.rb": """# frozen_string_literal: true

class CreateJwtDenylists < ActiveRecord::Migration[8.1]
  def change
    create_table :jwt_denylists do |t|
      t.string :jti, null: false
      t.datetime :exp, null: false
    end
    add_index :jwt_denylists, :jti
  end
end
""",
    "api/db/migrate/20260519012433_create_farms.rb": """# frozen_string_literal: true

class CreateFarms < ActiveRecord::Migration[8.1]
  def change
    create_table :farms do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :total_acres, precision: 10, scale: 2, null: false
      t.string :county, null: false
      t.integer :region, null: false, default: 1
      t.integer :primary_commodity, null: false, default: 0

      t.timestamps
    end
    add_index :farms, :region
    add_index :farms, :primary_commodity
  end
end
""",
    "api/db/migrate/20260519012435_create_fields.rb": """# frozen_string_literal: true

class CreateFields < ActiveRecord::Migration[8.1]
  def change
    create_table :fields do |t|
      t.references :farm, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :acres, precision: 10, scale: 2, null: false
      t.string :soil_type, null: false
      t.integer :primary_commodity, null: false, default: 0

      t.timestamps
    end
    add_index :fields, :primary_commodity
  end
end
""",
    "api/db/migrate/20260519012437_create_input_costs.rb": """# frozen_string_literal: true

class CreateInputCosts < ActiveRecord::Migration[8.1]
  def change
    create_table :input_costs do |t|
      t.references :field, null: false, foreign_key: true
      t.integer :season_year, null: false
      t.integer :category, null: false
      t.decimal :amount_per_acre, precision: 10, scale: 2, null: false
      t.text :notes

      t.timestamps
    end
    add_index :input_costs, %i[field_id season_year category], unique: true, name: "idx_input_costs_field_season_category"
    add_index :input_costs, :season_year
    add_index :input_costs, :category
  end
end
""",
    "api/db/migrate/20260519012440_create_benchmark_regions.rb": """# frozen_string_literal: true

class CreateBenchmarkRegions < ActiveRecord::Migration[8.1]
  def change
    create_table :benchmark_regions do |t|
      t.integer :region, null: false
      t.integer :commodity, null: false
      t.integer :season_year, null: false
      t.decimal :seed_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :fertilizer_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :chemicals_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :labor_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :total_operating_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :total_cost_per_acre, precision: 10, scale: 2, null: false
      t.decimal :assumed_yield, precision: 10, scale: 2, null: false
      t.decimal :assumed_price, precision: 10, scale: 2, null: false
      t.string :source, null: false

      t.timestamps
    end
    add_index :benchmark_regions, %i[region commodity season_year], unique: true, name: "idx_benchmark_regions_lookup"
  end
end
""",
    "api/db/migrate/20260519012438_create_scenarios.rb": """# frozen_string_literal: true

class CreateScenarios < ActiveRecord::Migration[8.1]
  def change
    create_table :scenarios do |t|
      t.references :farm, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :commodity_price, precision: 10, scale: 4
      t.decimal :yield_assumption, precision: 10, scale: 2
      t.decimal :downside_commodity_price, precision: 10, scale: 4
      t.decimal :downside_yield, precision: 10, scale: 2
      t.jsonb :results, default: {}, null: false

      t.timestamps
    end
  end
end
""",
    "api/db/migrate/20260519012441_create_peer_comparisons.rb": """# frozen_string_literal: true

class CreatePeerComparisons < ActiveRecord::Migration[8.1]
  def change
    create_table :peer_comparisons do |t|
      t.references :scenario, null: false, foreign_key: true, index: { unique: true }
      t.references :benchmark_region, null: false, foreign_key: true
      t.decimal :seed_percentile, precision: 5, scale: 2
      t.decimal :fertilizer_percentile, precision: 5, scale: 2
      t.decimal :chemicals_percentile, precision: 5, scale: 2
      t.decimal :total_cost_percentile, precision: 5, scale: 2
      t.jsonb :summary, default: {}, null: false

      t.timestamps
    end
  end
end
""",
    "api/db/migrate/20260519012443_create_analyst_conversations.rb": """# frozen_string_literal: true

class CreateAnalystConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :analyst_conversations do |t|
      t.references :farm, null: false, foreign_key: true
      t.references :scenario, foreign_key: true
      t.jsonb :context_snapshot, default: {}, null: false

      t.timestamps
    end
  end
end
""",
    "api/db/migrate/20260519012445_create_analyst_messages.rb": """# frozen_string_literal: true

class CreateAnalystMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :analyst_messages do |t|
      t.references :analyst_conversation, null: false, foreign_key: true
      t.integer :role, null: false
      t.text :content, null: false
      t.integer :token_count

      t.timestamps
    end
    add_index :analyst_messages, :role
  end
end
""",
    "api/db/migrate/20260519012446_create_analyst_reports.rb": """# frozen_string_literal: true

class CreateAnalystReports < ActiveRecord::Migration[8.1]
  def change
    create_table :analyst_reports do |t|
      t.references :scenario, null: false, foreign_key: true, index: { unique: true }
      t.text :summary, null: false
      t.jsonb :key_findings, default: [], null: false
      t.jsonb :recommendations, default: [], null: false
      t.jsonb :risk_flags, default: [], null: false
      t.text :lender_narrative
      t.datetime :generated_at, null: false

      t.timestamps
    end
  end
end
""",
    "api/db/migrate/20260519012448_create_decisions.rb": """# frozen_string_literal: true

class CreateDecisions < ActiveRecord::Migration[8.1]
  def change
    create_table :decisions do |t|
      t.references :scenario, null: false, foreign_key: true, index: { unique: true }
      t.integer :decision_type, null: false
      t.text :notes
      t.datetime :decided_at, null: false
      t.text :actual_outcome

      t.timestamps
    end
    add_index :decisions, :decision_type
  end
end
""",
}

# Numbered migrations (manifest aliases; same schema as timestamped migrations)
_NUM_MAP = [
    ("01", "api/db/migrate/20260519012432_create_users.rb", "01_create_users.rb"),
    ("02", "api/db/migrate/20260519012449_create_jwt_denylists.rb", "02_create_jwt_denylists.rb"),
    ("03", "api/db/migrate/20260519012433_create_farms.rb", "03_create_farms.rb"),
    ("04", "api/db/migrate/20260519012435_create_fields.rb", "04_create_fields.rb"),
    ("05", "api/db/migrate/20260519012437_create_input_costs.rb", "05_create_input_costs.rb"),
    ("06", "api/db/migrate/20260519012440_create_benchmark_regions.rb", "06_create_benchmark_regions.rb"),
    ("07", "api/db/migrate/20260519012438_create_scenarios.rb", "07_create_scenarios.rb"),
    ("08", "api/db/migrate/20260519012441_create_peer_comparisons.rb", "08_create_peer_comparisons.rb"),
    ("09", "api/db/migrate/20260519012448_create_decisions.rb", "09_create_decisions.rb"),
    ("10", "api/db/migrate/20260519012443_create_analyst_conversations.rb", "10_create_analyst_conversations.rb"),
    ("11", "api/db/migrate/20260519012445_create_analyst_messages.rb", "11_create_analyst_messages.rb"),
    ("12", "api/db/migrate/20260519012446_create_analyst_reports.rb", "12_create_analyst_reports.rb"),
]
for _num, src_key, dest_name in _NUM_MAP:
    MIGRATIONS[f"api/db/migrate/{dest_name}"] = MIGRATIONS[src_key]

MIGRATIONS["api/db/migrate/20260518130000_add_status_to_analyst_reports.rb"] = """# frozen_string_literal: true

class AddStatusToAnalystReports < ActiveRecord::Migration[8.1]
  def change
    add_column :analyst_reports, :status, :integer, null: false, default: 0
    add_column :analyst_reports, :error_message, :text
    add_index :analyst_reports, :status
  end
end
"""

FIXTURES = {
    "api/test/fixtures/farms.yml": """henderson:
  user: one
  name: Henderson Family Farm
  total_acres: 1200
  county: Cape Girardeau
  region: 1
  primary_commodity: 0
""",
    "api/test/fixtures/fields.yml": """north_80:
  farm: henderson
  name: North 80
  acres: 80
  soil_type: Silt loam
  primary_commodity: 0
""",
    "api/test/fixtures/input_costs.yml": """seed:
  field: north_80
  season_year: 2026
  category: 0
  amount_per_acre: 105.5
""",
    "api/test/fixtures/benchmark_regions.yml": """central_corn:
  region: 1
  commodity: 0
  season_year: 2026
  seed_cost_per_acre: 99.38
  fertilizer_cost_per_acre: 187.01
  chemicals_cost_per_acre: 104.0
  labor_cost_per_acre: 22.6
  total_operating_cost_per_acre: 600.07
  total_cost_per_acre: 902.47
  assumed_yield: 176
  assumed_price: 4.33
  source: Extension 2026
""",
    "api/test/fixtures/scenarios.yml": """base_case:
  farm: henderson
  name: Base Case
  commodity_price: 4.33
  yield_assumption: 176
  downside_commodity_price: 3.80
  downside_yield: 160
  results: {}
""",
    "api/test/fixtures/peer_comparisons.yml": """henderson_base:
  scenario: base_case
  benchmark_region: central_corn
  seed_percentile: 50
  fertilizer_percentile: 50
  chemicals_percentile: 50
  total_cost_percentile: 50
  summary: {}
""",
    "api/test/fixtures/analyst_conversations.yml": """henderson_chat:
  farm: henderson
  scenario: base_case
  context_snapshot: {}
""",
    "api/test/fixtures/analyst_messages.yml": """user_msg:
  analyst_conversation: henderson_chat
  role: 0
  content: How does my seed cost compare?
""",
    "api/test/fixtures/analyst_reports.yml": """henderson_report:
  scenario: base_case
  summary: Margins are acceptable at base case.
  key_findings: []
  recommendations: []
  risk_flags: []
  lender_narrative: Sample narrative
  generated_at: 2026-05-19 12:00:00
""",
    "api/test/fixtures/decisions.yml": """henderson_decision:
  scenario: base_case
  decision_type: 0
  decided_at: 2026-03-15 10:00:00
""",
    "api/test/fixtures/jwt_denylists.yml": """revoked:
  jti: deadbeef-dead-beef-dead-beefdeadbeef
  exp: 2099-01-01 00:00:00
""",
}

MODEL_TESTS = """# frozen_string_literal: true

require \"test_helper\"

class {class_name}Test < ActiveSupport::TestCase
  test \"fixture loads\" do
    assert {fixture}.valid?, {fixture}.errors.full_messages.join(\", \")
  end
end
"""

PEER_FARMS_JSON = "[]\n"


def main() -> int:
    missing = load_missing()
    missing_set = set(missing)
    restored = 0
    skipped = []

    transcript = extract_from_transcripts(missing_set)
    for rel, content in transcript.items():
        write_file(rel, content)
        restored += 1

    for rel in missing:
        if (ROOT / rel).is_file():
            continue
        if rel.endswith(".keep"):
            write_file(rel, "")
            restored += 1
            continue
        if rel in MIGRATIONS:
            write_file(rel, MIGRATIONS[rel])
            restored += 1
            continue
        if rel in FIXTURES:
            write_file(rel, FIXTURES[rel])
            restored += 1
            continue
        if rel == "api/db/seeds/peer_farms.json":
            write_file(rel, PEER_FARMS_JSON)
            restored += 1
            continue
        if rel.startswith("api/test/models/") and rel.endswith("_test.rb"):
            model = rel.split("/")[-1].replace("_test.rb", "")
            class_name = "".join(p.capitalize() for p in model.split("_"))
            fixture_by_model = {
                "user": "one",
                "jwt_denylist": "revoked",
                "farm": "henderson",
                "field": "north_80",
                "input_cost": "seed",
                "benchmark_region": "central_corn",
                "scenario": "base_case",
                "peer_comparison": "henderson_base",
                "analyst_conversation": "henderson_chat",
                "analyst_message": "user_msg",
                "analyst_report": "henderson_report",
                "decision": "henderson_decision",
            }
            fixture = fixture_by_model[model]
            write_file(rel, MODEL_TESTS.format(class_name=class_name, fixture=fixture))
            restored += 1
            continue
        if copy_scaffold(rel):
            restored += 1
            continue
        skipped.append(rel)

    # Gemfile.lock via bundle
    if "api/Gemfile.lock" in missing_set and not (API / "Gemfile.lock").is_file():
        if (API / "Gemfile").is_file():
            subprocess.run(["bundle", "lock"], cwd=API, check=False)

    # schema.rb via migrate
    if "api/db/schema.rb" in missing_set and not (API / "db/schema.rb").is_file():
        subprocess.run(["bin/rails", "db:migrate"], cwd=API, check=False)

    still_missing = [p for p in missing if not (ROOT / p).is_file()]
    print(f"restored_attempts={restored} still_missing={len(still_missing)}")
    for p in still_missing:
        print(f"  MISSING: {p}")
    return 0 if not still_missing else 1


if __name__ == "__main__":
    raise SystemExit(main())
