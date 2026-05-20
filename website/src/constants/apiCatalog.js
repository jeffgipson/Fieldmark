/**
 * API endpoint catalog for developer docs and playground.
 * Canonical reference: api/docs/API.md
 */

export const API_GROUPS = [
  {
    id: "health",
    label: "Health",
    endpoints: [
      {
        id: "health",
        method: "GET",
        path: "/api/health",
        title: "Health check",
        auth: false,
        description: "Verify the API is running. No authentication required.",
        responseNote: "Returns `{ data: { status: \"ok\" } }`."
      }
    ]
  },
  {
    id: "auth",
    label: "Authentication",
    endpoints: [
      {
        id: "auth-register",
        method: "POST",
        path: "/api/v1/auth/register",
        title: "Register",
        auth: false,
        description: "Create a farmer account. Returns user profile and JWT in `data.token`.",
        sampleBody: {
          user: {
            email: "mike@example.com",
            password: "password123",
            password_confirmation: "password123",
            first_name: "Mike",
            last_name: "Henderson"
          }
        }
      },
      {
        id: "auth-login",
        method: "POST",
        path: "/api/v1/auth/login",
        title: "Login",
        auth: false,
        description: "Exchange email and password for a JWT. Rate limited to 10 requests/min per IP.",
        sampleBody: {
          user: { email: "demo@fieldmark.app", password: "password123" }
        }
      },
      {
        id: "auth-demo",
        method: "POST",
        path: "/api/v1/auth/demo",
        title: "Demo login",
        auth: false,
        description:
          "Seed (if needed) and sign in as the demo farmer. Returns JWT in `data.token`. Ideal for playground testing.",
        sampleBody: {}
      },
      {
        id: "auth-logout",
        method: "DELETE",
        path: "/api/v1/auth/logout",
        title: "Logout",
        auth: true,
        description: "Revoke the current JWT (denylist)."
      }
    ]
  },
  {
    id: "benchmarks",
    label: "Benchmarks",
    endpoints: [
      {
        id: "benchmarks-index",
        method: "GET",
        path: "/api/v1/benchmarks",
        title: "Regional benchmarks",
        auth: true,
        description:
          "MU Extension 2026 crop budgets by region and commodity. Returns per-acre cost breakdown.",
        queryParams: [
          { name: "region", required: true, example: "central", hint: "northern | central | southwest" },
          { name: "commodity", required: true, example: "corn", hint: "corn | soybean" },
          { name: "year", required: false, example: "2026" }
        ]
      }
    ]
  },
  {
    id: "farms",
    label: "Farms",
    endpoints: [
      {
        id: "farms-list",
        method: "GET",
        path: "/api/v1/farms",
        title: "List farms",
        auth: true,
        description: "Paginated list of farms for the current user.",
        queryParams: [
          { name: "page", required: false, example: "1" },
          { name: "per_page", required: false, example: "25" }
        ]
      },
      {
        id: "farms-show",
        method: "GET",
        path: "/api/v1/farms/:farm_id",
        title: "Get farm",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }]
      },
      {
        id: "farms-create",
        method: "POST",
        path: "/api/v1/farms",
        title: "Create farm",
        auth: true,
        sampleBody: {
          farm: {
            name: "Henderson Family Farm",
            total_acres: 1200,
            county: "Cape Girardeau",
            region: "central",
            primary_commodity: "corn"
          }
        }
      },
      {
        id: "farms-summary",
        method: "GET",
        path: "/api/v1/farms/:farm_id/summary",
        title: "Farm summary",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }],
        queryParams: [{ name: "scenario_id", required: false, example: "1" }],
        description: "Financial rollup: mapped acres, operating costs, optional scenario snapshot."
      },
      {
        id: "farms-underwriting",
        method: "GET",
        path: "/api/v1/farms/:farm_id/underwriting",
        title: "Underwriting read",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }],
        queryParams: [{ name: "scenario_id", required: false, example: "1" }],
        description: "Lender-style file read with pillars and risk factors (not a loan approval)."
      }
    ]
  },
  {
    id: "fields",
    label: "Fields",
    endpoints: [
      {
        id: "fields-list",
        method: "GET",
        path: "/api/v1/farms/:farm_id/fields",
        title: "List fields",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }]
      },
      {
        id: "fields-create",
        method: "POST",
        path: "/api/v1/farms/:farm_id/fields",
        title: "Create field",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }],
        sampleBody: {
          field: {
            name: "North 80",
            acres: 80,
            soil_type: "Silt loam",
            primary_commodity: "corn"
          }
        }
      }
    ]
  },
  {
    id: "input-costs",
    label: "Input costs",
    endpoints: [
      {
        id: "input-costs-list",
        method: "GET",
        path: "/api/v1/fields/:field_id/input_costs",
        title: "List input costs",
        auth: true,
        pathParams: [{ name: "field_id", example: "1" }]
      },
      {
        id: "input-costs-create",
        method: "POST",
        path: "/api/v1/fields/:field_id/input_costs",
        title: "Create input cost",
        auth: true,
        pathParams: [{ name: "field_id", example: "1" }],
        sampleBody: {
          input_cost: {
            season_year: 2026,
            category: "seed",
            amount_per_acre: 105.5,
            notes: "Premium hybrid"
          }
        }
      }
    ]
  },
  {
    id: "scenarios",
    label: "Scenarios",
    endpoints: [
      {
        id: "scenarios-list",
        method: "GET",
        path: "/api/v1/farms/:farm_id/scenarios",
        title: "List scenarios",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }]
      },
      {
        id: "scenarios-create",
        method: "POST",
        path: "/api/v1/farms/:farm_id/scenarios",
        title: "Create scenario",
        auth: true,
        pathParams: [{ name: "farm_id", example: "1" }],
        sampleBody: {
          scenario: {
            name: "Base Case 2026",
            commodity_price: 4.33,
            yield_assumption: 176,
            downside_commodity_price: 3.8,
            downside_yield: 160
          }
        }
      },
      {
        id: "scenarios-calculate",
        method: "POST",
        path: "/api/v1/farms/:farm_id/scenarios/:scenario_id/calculate",
        title: "Calculate margins",
        auth: true,
        pathParams: [
          { name: "farm_id", example: "1" },
          { name: "scenario_id", example: "1" }
        ],
        description: "Run base and downside margin calculations for the scenario."
      },
      {
        id: "scenarios-compare",
        method: "POST",
        path: "/api/v1/farms/:farm_id/scenarios/:scenario_id/compare",
        title: "Peer comparison",
        auth: true,
        pathParams: [
          { name: "farm_id", example: "1" },
          { name: "scenario_id", example: "1" }
        ],
        description: "Compare field costs against MU Extension regional benchmarks."
      },
      {
        id: "scenarios-forecast",
        method: "GET",
        path: "/api/v1/farms/:farm_id/scenarios/:scenario_id/forecast",
        title: "Forecast timeline",
        auth: true,
        pathParams: [
          { name: "farm_id", example: "1" },
          { name: "scenario_id", example: "1" }
        ],
        description: "Three-year forecast when season snapshots exist."
      }
    ]
  },
  {
    id: "analyst",
    label: "AI analyst",
    endpoints: [
      {
        id: "conversations-create",
        method: "POST",
        path: "/api/v1/conversations",
        title: "Start conversation",
        auth: true,
        sampleBody: { conversation: { farm_id: 1, scenario_id: 1 } },
        description: "Open a Dale analyst chat session tied to a farm and scenario."
      },
      {
        id: "messages-create",
        method: "POST",
        path: "/api/v1/conversations/:conversation_id/messages",
        title: "Send message",
        auth: true,
        pathParams: [{ name: "conversation_id", example: "1" }],
        sampleBody: { message: { content: "How do my seed costs compare to peers?" } },
        description: "Requires ANTHROPIC_API_KEY on the server."
      },
      {
        id: "report-show",
        method: "GET",
        path: "/api/v1/scenarios/:scenario_id/report",
        title: "Get lender report",
        auth: true,
        pathParams: [{ name: "scenario_id", example: "1" }],
        description: "Poll until `data.status` is `completed` or `failed`."
      },
      {
        id: "report-create",
        method: "POST",
        path: "/api/v1/scenarios/:scenario_id/report",
        title: "Generate lender report",
        auth: true,
        pathParams: [{ name: "scenario_id", example: "1" }],
        description: "Returns 202 Accepted; runs async via background jobs. Requires `bin/jobs`."
      }
    ]
  },
  {
    id: "decisions",
    label: "Decisions",
    endpoints: [
      {
        id: "decision-create",
        method: "POST",
        path: "/api/v1/scenarios/:scenario_id/decision",
        title: "Log decision",
        auth: true,
        pathParams: [{ name: "scenario_id", example: "1" }],
        sampleBody: {
          decision: {
            decision_type: "proceed",
            notes: "Margins acceptable at base case."
          }
        }
      }
    ]
  },
  {
    id: "billing",
    label: "Billing",
    endpoints: [
      {
        id: "billing-show",
        method: "GET",
        path: "/api/v1/billing",
        title: "Current subscription",
        auth: true,
        description: "Mock Stripe subscription state (Basic / Pro)."
      },
      {
        id: "billing-plans",
        method: "GET",
        path: "/api/v1/billing/plans",
        title: "List plans",
        auth: true
      }
    ]
  },
  {
    id: "profile",
    label: "Profile",
    endpoints: [
      {
        id: "profile-show",
        method: "GET",
        path: "/api/v1/profile",
        title: "Get profile",
        auth: true
      }
    ]
  }
];

export const ALL_ENDPOINTS = API_GROUPS.flatMap((g) =>
  g.endpoints.map((ep) => ({ ...ep, group: g.label, groupId: g.id }))
);

export const DEFAULT_ENDPOINT_ID = "health";

export function findEndpoint(id) {
  return ALL_ENDPOINTS.find((ep) => ep.id === id) ?? ALL_ENDPOINTS[0];
}
