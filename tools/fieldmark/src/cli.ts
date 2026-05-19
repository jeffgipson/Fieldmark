#!/usr/bin/env node
import { Command } from "commander";
import { FieldmarkApiError, FieldmarkClient, persistSession } from "./api-client.js";
import { configPath, loadConfig, resolveBaseUrl, saveConfig } from "./config.js";
import { printData, printError, printJson } from "./output.js";

const program = new Command();

program
  .name("fieldmark")
  .description("CLI for the Fieldmark farm financial planning API")
  .option("--base-url <url>", "API base URL", resolveBaseUrl())
  .option("--json", "Output raw JSON envelope", false);

async function getClient(opts: { baseUrl?: string }): Promise<FieldmarkClient> {
  const config = await loadConfig();
  return FieldmarkClient.connect({
    baseUrl: opts.baseUrl ?? config.baseUrl,
  });
}

function handle<T>(opts: { json?: boolean }, fn: () => Promise<T>): Promise<void> {
  return fn()
    .then((result) => {
      if (opts.json) {
        printJson(result);
      } else if (result && typeof result === "object" && "data" in result) {
        printData(result as { data: unknown; meta?: unknown });
      } else {
        printJson(result);
      }
    })
    .catch((err) => {
      printError(err);
      process.exit(1);
    });
}

// --- config ---
const configCmd = program.command("config").description("Manage CLI configuration");

configCmd
  .command("show")
  .description("Show saved config path and values (token masked)")
  .action(async () => {
    const config = await loadConfig();
    printJson({
      path: configPath(),
      baseUrl: config.baseUrl,
      email: config.email,
      token: config.token ? `${config.token.slice(0, 12)}…` : undefined,
    });
  });

configCmd
  .command("set-url <url>")
  .description("Set default API base URL")
  .action(async (url: string) => {
    const config = await loadConfig();
    await saveConfig({ ...config, baseUrl: url.replace(/\/$/, "") });
    console.log(`Base URL set to ${url}`);
  });

// --- auth ---
const auth = program.command("auth").description("Authentication");

auth
  .command("register")
  .requiredOption("-e, --email <email>")
  .requiredOption("-p, --password <password>")
  .requiredOption("--first-name <name>")
  .requiredOption("--last-name <name>")
  .action(async (opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      const res = await client.register({
        email: opts.email,
        password: opts.password,
        password_confirmation: opts.password,
        first_name: opts.firstName,
        last_name: opts.lastName,
      });
      await persistSession(client, res.data, opts.email);
      console.log(`Registered ${res.data.email}. Token saved to ${configPath()}`);
      return res;
    });
  });

auth
  .command("login")
  .requiredOption("-e, --email <email>")
  .requiredOption("-p, --password <password>")
  .action(async (opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      const res = await client.login(opts.email, opts.password);
      await persistSession(client, res.data, opts.email);
      console.log(`Logged in as ${res.data.email}. Token saved to ${configPath()}`);
      return res;
    });
  });

auth.command("logout").action(async (_opts, cmd) => {
  const parent = cmd.parent?.parent?.opts() ?? {};
  await handle(parent, async () => {
    const client = await getClient(parent);
    const res = await client.logout();
    const config = await loadConfig();
    await saveConfig({ ...config, token: undefined });
    return res;
  });
});

auth.command("whoami").action(async (_opts, cmd) => {
  const parent = cmd.parent?.parent?.opts() ?? {};
  const config = await loadConfig();
  printJson({
    email: config.email,
    authenticated: Boolean(config.token),
    baseUrl: config.baseUrl,
  });
});

// --- health ---
program
  .command("health")
  .description("Check API health")
  .action(async (_opts, cmd) => {
    const parent = cmd.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await FieldmarkClient.connect({ baseUrl: parent.baseUrl });
      return client.health();
    });
  });

// --- benchmarks ---
program
  .command("benchmarks")
  .description("Get regional benchmark data")
  .requiredOption("-r, --region <region>", "northern | central | southwest")
  .requiredOption("-c, --commodity <commodity>", "corn | soybean")
  .option("-y, --year <year>", "Season year", "2026")
  .action(async (opts, cmd) => {
    const parent = cmd.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.benchmarks({
        region: opts.region,
        commodity: opts.commodity,
        year: Number(opts.year),
      });
    });
  });

// --- farms ---
const farms = program.command("farms").description("Manage farms");

farms.command("list").action(async (_opts, cmd) => {
  const parent = cmd.parent?.parent?.opts() ?? {};
  await handle(parent, async () => {
    const client = await getClient(parent);
    return client.listFarms();
  });
});

farms
  .command("create")
  .requiredOption("-n, --name <name>")
  .requiredOption("-a, --acres <acres>")
  .requiredOption("--county <county>")
  .requiredOption("--region <region>")
  .requiredOption("--commodity <commodity>", "corn | soybean | both")
  .action(async (opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.createFarm({
        name: opts.name,
        total_acres: Number(opts.acres),
        county: opts.county,
        region: opts.region,
        primary_commodity: opts.commodity,
      });
    });
  });

farms
  .command("show <id>")
  .action(async (id: string, _opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.getFarm(Number(id));
    });
  });

// --- fields ---
const fields = program.command("fields").description("Manage fields");

fields
  .command("list <farmId>")
  .action(async (farmId: string, _opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.listFields(Number(farmId));
    });
  });

fields
  .command("create <farmId>")
  .requiredOption("-n, --name <name>")
  .requiredOption("-a, --acres <acres>")
  .requiredOption("--soil <soil>")
  .requiredOption("--commodity <commodity>", "corn | soybean")
  .action(async (farmId: string, opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.createField(Number(farmId), {
        name: opts.name,
        acres: Number(opts.acres),
        soil_type: opts.soil,
        primary_commodity: opts.commodity,
      });
    });
  });

// --- scenarios ---
const scenarios = program.command("scenarios").description("Margin scenarios");

scenarios
  .command("list <farmId>")
  .action(async (farmId: string, _opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.listScenarios(Number(farmId));
    });
  });

scenarios
  .command("create <farmId>")
  .requiredOption("-n, --name <name>")
  .requiredOption("--price <price>", "Base case $/bu")
  .requiredOption("--yield <yield>", "Base case bu/ac")
  .requiredOption("--downside-price <price>")
  .requiredOption("--downside-yield <yield>")
  .action(async (farmId: string, opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.createScenario(Number(farmId), {
        name: opts.name,
        commodity_price: Number(opts.price),
        yield_assumption: Number(opts.yield),
        downside_commodity_price: Number(opts.downsidePrice),
        downside_yield: Number(opts.downsideYield),
      });
    });
  });

scenarios
  .command("calculate <farmId> <scenarioId>")
  .action(async (farmId: string, scenarioId: string, _opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.calculateScenario(Number(farmId), Number(scenarioId));
    });
  });

scenarios
  .command("compare <farmId> <scenarioId>")
  .action(async (farmId: string, scenarioId: string, _opts, cmd) => {
    const parent = cmd.parent?.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.compareScenario(Number(farmId), Number(scenarioId));
    });
  });

// --- analyst ---
program
  .command("ask")
  .description("Ask the AI analyst (creates conversation if needed)")
  .requiredOption("--farm-id <id>")
  .option("--scenario-id <id>")
  .option("--conversation-id <id>", "Reuse existing conversation")
  .argument("<question>", "Your question for the analyst")
  .action(async (question: string, opts, cmd) => {
    const parent = cmd.parent?.opts() ?? {};
    try {
      const client = await getClient(parent);
      let conversationId = opts.conversationId ? Number(opts.conversationId) : undefined;

      if (!conversationId) {
        const conv = await client.createConversation(
          Number(opts.farmId),
          opts.scenarioId ? Number(opts.scenarioId) : undefined
        );
        conversationId = conv.data.id as number;
        console.error(`Conversation ${conversationId} created.`);
      }

      const res = await client.sendMessage(conversationId, question);
      const assistant = (res.data as { assistant_message?: { content: string } })
        .assistant_message;
      if (parent.json) {
        printJson(res);
      } else {
        console.log(assistant?.content ?? res.data);
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });

program
  .command("report <scenarioId>")
  .description("Generate lender-ready analyst report")
  .action(async (scenarioId: string, _opts, cmd) => {
    const parent = cmd.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      console.error("Generating report (may take 15–30s)…");
      return client.generateReport(Number(scenarioId));
    });
  });

// --- decisions ---
program
  .command("decide <scenarioId>")
  .description("Log a decision for a scenario")
  .requiredOption("-t, --type <type>", "proceed | wait | modify | cancel")
  .option("--notes <notes>")
  .action(async (scenarioId: string, opts, cmd) => {
    const parent = cmd.parent?.opts() ?? {};
    await handle(parent, async () => {
      const client = await getClient(parent);
      return client.createDecision(Number(scenarioId), {
        decision_type: opts.type,
        notes: opts.notes,
        decided_at: new Date().toISOString(),
      });
    });
  });

program.parseAsync(process.argv).catch((err) => {
  if (err instanceof FieldmarkApiError) {
    printError(err);
  } else {
    console.error(err);
  }
  process.exit(1);
});
