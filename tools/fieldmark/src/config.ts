import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { FieldmarkConfig } from "./types.js";

const CONFIG_DIR = join(homedir(), ".fieldmark");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const DEFAULT_BASE_URL = "http://localhost:3000";

export function resolveBaseUrl(override?: string): string {
  return (
    override ||
    process.env.FIELDMARK_API_URL ||
    process.env.FIELDMARK_BASE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, "");
}

export function resolveToken(override?: string): string | undefined {
  return override || process.env.FIELDMARK_TOKEN || undefined;
}

export async function loadConfig(): Promise<FieldmarkConfig> {
  const fromEnv: FieldmarkConfig = {
    baseUrl: resolveBaseUrl(),
    token: resolveToken(),
    email: process.env.FIELDMARK_EMAIL,
  };

  try {
    const raw = await readFile(CONFIG_FILE, "utf8");
    const file = JSON.parse(raw) as FieldmarkConfig;
    return {
      baseUrl: fromEnv.baseUrl || file.baseUrl || DEFAULT_BASE_URL,
      token: fromEnv.token || file.token,
      email: fromEnv.email || file.email,
    };
  } catch {
    return fromEnv;
  }
}

export async function saveConfig(config: FieldmarkConfig): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function configPath(): string {
  return CONFIG_FILE;
}
