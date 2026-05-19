# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_19_215236) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "analyst_conversations", force: :cascade do |t|
    t.jsonb "context_snapshot"
    t.datetime "created_at", null: false
    t.bigint "farm_id", null: false
    t.bigint "scenario_id"
    t.datetime "updated_at", null: false
    t.index ["farm_id"], name: "index_analyst_conversations_on_farm_id"
    t.index ["scenario_id"], name: "index_analyst_conversations_on_scenario_id"
  end

  create_table "analyst_messages", force: :cascade do |t|
    t.bigint "analyst_conversation_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.integer "role"
    t.integer "token_count"
    t.datetime "updated_at", null: false
    t.index ["analyst_conversation_id"], name: "index_analyst_messages_on_analyst_conversation_id"
  end

  create_table "analyst_reports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error_message"
    t.datetime "generated_at"
    t.jsonb "key_findings"
    t.text "lender_narrative"
    t.jsonb "recommendations"
    t.jsonb "risk_flags"
    t.bigint "scenario_id", null: false
    t.integer "status", default: 0, null: false
    t.text "summary"
    t.datetime "updated_at", null: false
    t.index ["scenario_id"], name: "index_analyst_reports_on_scenario_id"
    t.index ["status"], name: "index_analyst_reports_on_status"
  end

  create_table "benchmark_regions", force: :cascade do |t|
    t.decimal "assumed_price"
    t.decimal "assumed_yield"
    t.decimal "chemicals_cost_per_acre"
    t.integer "commodity"
    t.datetime "created_at", null: false
    t.jsonb "detail", default: {}, null: false
    t.decimal "fertilizer_cost_per_acre"
    t.string "irrigation", default: "dryland", null: false
    t.decimal "labor_cost_per_acre"
    t.integer "region"
    t.date "retrieved_on"
    t.integer "season_year"
    t.decimal "seed_cost_per_acre"
    t.string "source"
    t.string "source_url"
    t.decimal "total_cost_per_acre"
    t.decimal "total_operating_cost_per_acre"
    t.datetime "updated_at", null: false
    t.index ["region", "commodity", "season_year", "irrigation"], name: "idx_benchmark_regions_on_region_commodity_season_irrigation", unique: true
  end

  create_table "decisions", force: :cascade do |t|
    t.text "actual_outcome"
    t.datetime "created_at", null: false
    t.datetime "decided_at"
    t.integer "decision_type"
    t.jsonb "field_notes", default: [], null: false
    t.text "notes"
    t.bigint "scenario_id", null: false
    t.datetime "updated_at", null: false
    t.integer "vendor_category"
    t.text "vendor_contact_notes"
    t.bigint "vendor_id"
    t.index ["scenario_id"], name: "index_decisions_on_scenario_id", unique: true
    t.index ["vendor_category"], name: "index_decisions_on_vendor_category"
    t.index ["vendor_id"], name: "index_decisions_on_vendor_id"
  end

  create_table "farm_history_imports", force: :cascade do |t|
    t.jsonb "applied_result", default: {}, null: false
    t.datetime "created_at", null: false
    t.text "error_message"
    t.bigint "farm_id", null: false
    t.string "filename"
    t.jsonb "parsed_payload", default: {}, null: false
    t.text "raw_csv"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["farm_id", "created_at"], name: "index_farm_history_imports_on_farm_id_and_created_at"
    t.index ["farm_id"], name: "index_farm_history_imports_on_farm_id"
  end

  create_table "farm_priorities", force: :cascade do |t|
    t.integer "category", default: 0, null: false
    t.datetime "created_at", null: false
    t.bigint "farm_id", null: false
    t.text "note"
    t.integer "position", default: 0, null: false
    t.integer "season_year", null: false
    t.integer "source", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_farm_priorities_on_category"
    t.index ["farm_id", "season_year", "position"], name: "index_farm_priorities_on_farm_id_and_season_year_and_position"
    t.index ["farm_id", "season_year", "status"], name: "index_farm_priorities_on_farm_id_and_season_year_and_status"
    t.index ["farm_id"], name: "index_farm_priorities_on_farm_id"
  end

  create_table "farm_season_snapshots", force: :cascade do |t|
    t.decimal "actual_price", precision: 8, scale: 4
    t.decimal "actual_total_operating_per_acre", precision: 10, scale: 2
    t.decimal "actual_yield", precision: 8, scale: 2
    t.datetime "created_at", null: false
    t.bigint "farm_id", null: false
    t.text "notes"
    t.integer "season_year", null: false
    t.integer "source", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["farm_id", "season_year"], name: "index_farm_season_snapshots_on_farm_id_and_season_year", unique: true
    t.index ["farm_id"], name: "index_farm_season_snapshots_on_farm_id"
    t.index ["season_year"], name: "index_farm_season_snapshots_on_season_year"
  end

  create_table "farms", force: :cascade do |t|
    t.boolean "benchmark_cohort", default: false, null: false
    t.jsonb "boundary"
    t.string "county"
    t.datetime "cover_photo_updated_at"
    t.datetime "created_at", null: false
    t.decimal "latitude", precision: 10, scale: 7
    t.jsonb "location_meta", default: {}, null: false
    t.decimal "longitude", precision: 10, scale: 7
    t.string "name"
    t.integer "primary_commodity"
    t.integer "region"
    t.decimal "total_acres"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["benchmark_cohort"], name: "index_farms_on_benchmark_cohort"
    t.index ["latitude", "longitude"], name: "index_farms_on_coordinates"
    t.index ["region"], name: "index_farms_on_region"
    t.index ["user_id"], name: "index_farms_on_user_id"
  end

  create_table "field_risk_profiles", force: :cascade do |t|
    t.boolean "bottomland", default: false, null: false
    t.datetime "created_at", null: false
    t.integer "drainage", default: 1, null: false
    t.bigint "field_id", null: false
    t.integer "flood_events_last_5_years"
    t.text "risk_notes"
    t.datetime "updated_at", null: false
    t.index ["drainage"], name: "index_field_risk_profiles_on_drainage"
    t.index ["field_id"], name: "index_field_risk_profiles_on_field_id", unique: true
  end

  create_table "fields", force: :cascade do |t|
    t.decimal "acres"
    t.jsonb "boundary"
    t.datetime "cover_photo_updated_at"
    t.datetime "created_at", null: false
    t.text "description"
    t.bigint "farm_id", null: false
    t.decimal "latitude", precision: 10, scale: 7
    t.jsonb "location_meta", default: {}, null: false
    t.decimal "longitude", precision: 10, scale: 7
    t.string "name"
    t.integer "primary_commodity"
    t.string "soil_type"
    t.datetime "updated_at", null: false
    t.index ["farm_id"], name: "index_fields_on_farm_id"
    t.index ["latitude", "longitude"], name: "index_fields_on_coordinates"
  end

  create_table "input_costs", force: :cascade do |t|
    t.decimal "amount_per_acre"
    t.integer "category"
    t.datetime "created_at", null: false
    t.bigint "field_id", null: false
    t.text "notes"
    t.integer "season_year"
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_input_costs_on_category"
    t.index ["field_id", "season_year"], name: "index_input_costs_on_field_id_and_season_year"
    t.index ["field_id"], name: "index_input_costs_on_field_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "exp"
    t.string "jti"
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti"
  end

  create_table "macro_drivers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "driver_key", null: false
    t.date "effective_on", null: false
    t.integer "season_year", null: false
    t.string "source", null: false
    t.string "source_url"
    t.datetime "updated_at", null: false
    t.decimal "value", precision: 12, scale: 4, null: false
    t.index ["season_year", "driver_key"], name: "index_macro_drivers_on_season_year_and_driver_key", unique: true
  end

  create_table "peer_comparisons", force: :cascade do |t|
    t.bigint "benchmark_region_id", null: false
    t.decimal "chemicals_percentile"
    t.datetime "created_at", null: false
    t.decimal "fertilizer_percentile"
    t.bigint "scenario_id", null: false
    t.decimal "seed_percentile"
    t.jsonb "summary"
    t.decimal "total_cost_percentile"
    t.datetime "updated_at", null: false
    t.index ["benchmark_region_id"], name: "index_peer_comparisons_on_benchmark_region_id"
    t.index ["scenario_id"], name: "index_peer_comparisons_on_scenario_id"
  end

  create_table "scenarios", force: :cascade do |t|
    t.decimal "commodity_price"
    t.datetime "created_at", null: false
    t.decimal "downside_commodity_price"
    t.decimal "downside_yield"
    t.bigint "farm_id", null: false
    t.string "name"
    t.integer "planning_mode", default: 0, null: false
    t.jsonb "projection_years", default: [], null: false
    t.jsonb "results"
    t.decimal "target_margin_per_acre", precision: 10, scale: 2
    t.decimal "target_total_margin", precision: 12, scale: 2
    t.datetime "updated_at", null: false
    t.decimal "yield_assumption"
    t.index ["farm_id"], name: "index_scenarios_on_farm_id"
    t.index ["planning_mode"], name: "index_scenarios_on_planning_mode"
  end

  create_table "user_invitations", force: :cascade do |t|
    t.bigint "accepted_user_id"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.datetime "expires_at", null: false
    t.bigint "inviter_id", null: false
    t.text "message"
    t.integer "status", default: 0, null: false
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.index ["accepted_user_id"], name: "index_user_invitations_on_accepted_user_id"
    t.index ["inviter_id", "email", "status"], name: "index_user_invitations_on_inviter_email_status"
    t.index ["inviter_id"], name: "index_user_invitations_on_inviter_id"
    t.index ["status"], name: "index_user_invitations_on_status"
    t.index ["token"], name: "index_user_invitations_on_token", unique: true
  end

  create_table "user_vendor_contacts", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "last_contacted_at"
    t.text "notes"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.bigint "vendor_id", null: false
    t.index ["user_id", "vendor_id"], name: "index_user_vendor_contacts_on_user_id_and_vendor_id", unique: true
    t.index ["user_id"], name: "index_user_vendor_contacts_on_user_id"
    t.index ["vendor_id"], name: "index_user_vendor_contacts_on_vendor_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "avatar_updated_at"
    t.text "bio"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name"
    t.string "jti", null: false
    t.string "last_name"
    t.string "phone"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "role", default: 0
    t.jsonb "social_links", default: {}, null: false
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.datetime "subscription_current_period_end"
    t.integer "subscription_plan", default: 0, null: false
    t.integer "subscription_status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["stripe_customer_id"], name: "index_users_on_stripe_customer_id", unique: true, where: "(stripe_customer_id IS NOT NULL)"
    t.index ["subscription_plan"], name: "index_users_on_subscription_plan"
    t.index ["subscription_status"], name: "index_users_on_subscription_status"
  end

  create_table "vendors", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.text "billing_notes"
    t.integer "category", null: false
    t.string "city"
    t.jsonb "counties", default: [], null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "email"
    t.date "featured_until"
    t.decimal "latitude", precision: 10, scale: 7
    t.integer "listing_tier", default: 0, null: false
    t.decimal "longitude", precision: 10, scale: 7
    t.integer "monthly_listing_cents"
    t.string "name", null: false
    t.jsonb "offerings", default: [], null: false
    t.string "phone"
    t.text "profile_summary"
    t.integer "region"
    t.boolean "serves_statewide", default: false, null: false
    t.string "slug", null: false
    t.boolean "sponsored", default: false, null: false
    t.string "state", default: "MO", null: false
    t.string "street_address"
    t.datetime "updated_at", null: false
    t.string "website"
    t.index ["active"], name: "index_vendors_on_active"
    t.index ["category"], name: "index_vendors_on_category"
    t.index ["counties"], name: "index_vendors_on_counties", using: :gin
    t.index ["latitude", "longitude"], name: "index_vendors_on_latitude_and_longitude"
    t.index ["listing_tier"], name: "index_vendors_on_listing_tier"
    t.index ["slug"], name: "index_vendors_on_slug", unique: true
  end

  add_foreign_key "analyst_conversations", "farms"
  add_foreign_key "analyst_conversations", "scenarios"
  add_foreign_key "analyst_messages", "analyst_conversations"
  add_foreign_key "analyst_reports", "scenarios"
  add_foreign_key "decisions", "scenarios"
  add_foreign_key "decisions", "vendors"
  add_foreign_key "farm_history_imports", "farms"
  add_foreign_key "farm_priorities", "farms"
  add_foreign_key "farm_season_snapshots", "farms"
  add_foreign_key "farms", "users"
  add_foreign_key "field_risk_profiles", "fields"
  add_foreign_key "fields", "farms"
  add_foreign_key "input_costs", "fields"
  add_foreign_key "peer_comparisons", "benchmark_regions"
  add_foreign_key "peer_comparisons", "scenarios"
  add_foreign_key "scenarios", "farms"
  add_foreign_key "user_invitations", "users", column: "accepted_user_id"
  add_foreign_key "user_invitations", "users", column: "inviter_id"
  add_foreign_key "user_vendor_contacts", "users"
  add_foreign_key "user_vendor_contacts", "vendors"
end
