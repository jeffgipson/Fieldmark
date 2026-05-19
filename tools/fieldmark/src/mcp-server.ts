#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { FieldmarkApiError, FieldmarkClient } from "./api-client.js";

const server = new Server(
  { name: "fieldmark", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

async function client(): Promise<FieldmarkClient> {
  return FieldmarkClient.connect();
}

function textResult(data: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    isError,
  };
}

function toolError(err: unknown) {
  if (err instanceof FieldmarkApiError) {
    return textResult({ message: err.message, status: err.status, errors: err.errors }, true);
  }
  return textResult(
    { message: err instanceof Error ? err.message : String(err) },
    true
  );
}

const tools = [
  {
    name: "fieldmark_health",
    description: "Check Fieldmark API health (no auth required)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "fieldmark_benchmarks",
    description:
      "Get MU Extension regional benchmark costs. Requires region (northern|central|southwest) and commodity (corn|soybean).",
    inputSchema: {
      type: "object",
      properties: {
        region: { type: "string", enum: ["northern", "central", "southwest"] },
        commodity: { type: "string", enum: ["corn", "soybean"] },
        year: { type: "number", description: "Season year, default 2026" },
      },
      required: ["region", "commodity"],
    },
  },
  {
    name: "fieldmark_farms_list",
    description: "List farms for the authenticated user",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "fieldmark_farms_create",
    description: "Create a new farm",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        total_acres: { type: "number" },
        county: { type: "string" },
        region: { type: "string", enum: ["northern", "central", "southwest"] },
        primary_commodity: { type: "string", enum: ["corn", "soybean", "both"] },
      },
      required: ["name", "total_acres", "county", "region", "primary_commodity"],
    },
  },
  {
    name: "fieldmark_fields_list",
    description: "List fields for a farm",
    inputSchema: {
      type: "object",
      properties: { farm_id: { type: "number" } },
      required: ["farm_id"],
    },
  },
  {
    name: "fieldmark_fields_create",
    description: "Create a field on a farm",
    inputSchema: {
      type: "object",
      properties: {
        farm_id: { type: "number" },
        name: { type: "string" },
        acres: { type: "number" },
        soil_type: { type: "string" },
        primary_commodity: { type: "string", enum: ["corn", "soybean"] },
      },
      required: ["farm_id", "name", "acres", "soil_type", "primary_commodity"],
    },
  },
  {
    name: "fieldmark_input_costs_create",
    description: "Add an input cost to a field",
    inputSchema: {
      type: "object",
      properties: {
        field_id: { type: "number" },
        season_year: { type: "number" },
        category: {
          type: "string",
          enum: ["seed", "fertilizer", "chemicals", "labor", "custom_hire", "other"],
        },
        amount_per_acre: { type: "number" },
        notes: { type: "string" },
      },
      required: ["field_id", "season_year", "category", "amount_per_acre"],
    },
  },
  {
    name: "fieldmark_scenarios_create",
    description: "Create a margin scenario for a farm",
    inputSchema: {
      type: "object",
      properties: {
        farm_id: { type: "number" },
        name: { type: "string" },
        commodity_price: { type: "number" },
        yield_assumption: { type: "number" },
        downside_commodity_price: { type: "number" },
        downside_yield: { type: "number" },
      },
      required: [
        "farm_id",
        "name",
        "commodity_price",
        "yield_assumption",
        "downside_commodity_price",
        "downside_yield",
      ],
    },
  },
  {
    name: "fieldmark_scenarios_calculate",
    description: "Calculate margin results for a scenario",
    inputSchema: {
      type: "object",
      properties: {
        farm_id: { type: "number" },
        scenario_id: { type: "number" },
      },
      required: ["farm_id", "scenario_id"],
    },
  },
  {
    name: "fieldmark_scenarios_compare",
    description: "Compare scenario costs to regional peer benchmarks",
    inputSchema: {
      type: "object",
      properties: {
        farm_id: { type: "number" },
        scenario_id: { type: "number" },
      },
      required: ["farm_id", "scenario_id"],
    },
  },
  {
    name: "fieldmark_analyst_ask",
    description:
      "Ask the independent AI analyst a question. Creates a conversation if conversation_id omitted. Run calculate + compare first for best answers.",
    inputSchema: {
      type: "object",
      properties: {
        farm_id: { type: "number" },
        scenario_id: { type: "number" },
        conversation_id: { type: "number" },
        question: { type: "string" },
      },
      required: ["farm_id", "question"],
    },
  },
  {
    name: "fieldmark_report_generate",
    description: "Generate a lender-ready analyst report for a scenario (slow, ~15–30s)",
    inputSchema: {
      type: "object",
      properties: { scenario_id: { type: "number" } },
      required: ["scenario_id"],
    },
  },
  {
    name: "fieldmark_decision_create",
    description: "Log the farmer's decision for a scenario",
    inputSchema: {
      type: "object",
      properties: {
        scenario_id: { type: "number" },
        decision_type: { type: "string", enum: ["proceed", "wait", "modify", "cancel"] },
        notes: { type: "string" },
      },
      required: ["scenario_id", "decision_type"],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const api = await client();

    switch (name) {
      case "fieldmark_health": {
        const res = await api.health();
        return textResult(res.data);
      }

      case "fieldmark_benchmarks": {
        const p = z
          .object({
            region: z.enum(["northern", "central", "southwest"]),
            commodity: z.enum(["corn", "soybean"]),
            year: z.number().optional(),
          })
          .parse(args);
        const res = await api.benchmarks(p);
        return textResult(res.data);
      }

      case "fieldmark_farms_list": {
        const res = await api.listFarms();
        return textResult({ farms: res.data, meta: res.meta });
      }

      case "fieldmark_farms_create": {
        const p = z
          .object({
            name: z.string(),
            total_acres: z.number(),
            county: z.string(),
            region: z.enum(["northern", "central", "southwest"]),
            primary_commodity: z.enum(["corn", "soybean", "both"]),
          })
          .parse(args);
        const res = await api.createFarm(p);
        return textResult(res.data);
      }

      case "fieldmark_fields_list": {
        const { farm_id } = z.object({ farm_id: z.number() }).parse(args);
        const res = await api.listFields(farm_id);
        return textResult(res.data);
      }

      case "fieldmark_fields_create": {
        const p = z
          .object({
            farm_id: z.number(),
            name: z.string(),
            acres: z.number(),
            soil_type: z.string(),
            primary_commodity: z.enum(["corn", "soybean"]),
          })
          .parse(args);
        const { farm_id, ...field } = p;
        const res = await api.createField(farm_id, field);
        return textResult(res.data);
      }

      case "fieldmark_input_costs_create": {
        const p = z
          .object({
            field_id: z.number(),
            season_year: z.number(),
            category: z.enum([
              "seed",
              "fertilizer",
              "chemicals",
              "labor",
              "custom_hire",
              "other",
            ]),
            amount_per_acre: z.number(),
            notes: z.string().optional(),
          })
          .parse(args);
        const { field_id, ...inputCost } = p;
        const res = await api.createInputCost(field_id, inputCost);
        return textResult(res.data);
      }

      case "fieldmark_scenarios_create": {
        const p = z
          .object({
            farm_id: z.number(),
            name: z.string(),
            commodity_price: z.number(),
            yield_assumption: z.number(),
            downside_commodity_price: z.number(),
            downside_yield: z.number(),
          })
          .parse(args);
        const { farm_id, ...scenario } = p;
        const res = await api.createScenario(farm_id, scenario);
        return textResult(res.data);
      }

      case "fieldmark_scenarios_calculate": {
        const { farm_id, scenario_id } = z
          .object({ farm_id: z.number(), scenario_id: z.number() })
          .parse(args);
        const res = await api.calculateScenario(farm_id, scenario_id);
        return textResult(res.data);
      }

      case "fieldmark_scenarios_compare": {
        const { farm_id, scenario_id } = z
          .object({ farm_id: z.number(), scenario_id: z.number() })
          .parse(args);
        const res = await api.compareScenario(farm_id, scenario_id);
        return textResult(res.data);
      }

      case "fieldmark_analyst_ask": {
        const p = z
          .object({
            farm_id: z.number(),
            scenario_id: z.number().optional(),
            conversation_id: z.number().optional(),
            question: z.string(),
          })
          .parse(args);

        let conversationId = p.conversation_id;
        if (!conversationId) {
          const conv = await api.createConversation(p.farm_id, p.scenario_id);
          conversationId = conv.data.id as number;
        }

        const res = await api.sendMessage(conversationId, p.question);
        const data = res.data as {
          assistant_message?: { content: string };
        };
        return textResult({
          conversation_id: conversationId,
          answer: data.assistant_message?.content ?? res.data,
        });
      }

      case "fieldmark_report_generate": {
        const { scenario_id } = z.object({ scenario_id: z.number() }).parse(args);
        const res = await api.generateReport(scenario_id);
        return textResult(res.data);
      }

      case "fieldmark_decision_create": {
        const p = z
          .object({
            scenario_id: z.number(),
            decision_type: z.enum(["proceed", "wait", "modify", "cancel"]),
            notes: z.string().optional(),
          })
          .parse(args);
        const res = await api.createDecision(p.scenario_id, {
          decision_type: p.decision_type,
          notes: p.notes,
          decided_at: new Date().toISOString(),
        });
        return textResult(res.data);
      }

      default:
        return textResult({ error: `Unknown tool: ${name}` }, true);
    }
  } catch (err) {
    return toolError(err);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Fieldmark MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
