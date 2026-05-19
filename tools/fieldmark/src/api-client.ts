import type { ApiEnvelope, FieldmarkConfig, UserProfile } from "./types.js";
import { loadConfig, resolveBaseUrl, resolveToken } from "./config.js";

export class FieldmarkApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: { field: string; message: string }[] = []
  ) {
    super(message);
    this.name = "FieldmarkApiError";
  }
}

export class FieldmarkClient {
  private baseUrl: string;
  private token?: string;

  constructor(options: { baseUrl?: string; token?: string } = {}) {
    this.baseUrl = resolveBaseUrl(options.baseUrl);
    this.token = resolveToken(options.token);
  }

  static async connect(options: { baseUrl?: string; token?: string } = {}): Promise<FieldmarkClient> {
    const config = await loadConfig();
    return new FieldmarkClient({
      baseUrl: options.baseUrl ?? config.baseUrl,
      token: options.token ?? config.token,
    });
  }

  setToken(token: string | undefined): void {
    this.token = token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      query?: Record<string, string | number | undefined>;
      auth?: boolean;
    } = {}
  ): Promise<ApiEnvelope<T>> {
    const { body, query, auth = true } = options;
    const url = new URL(path.startsWith("http") ? path : `${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (auth) {
      if (!this.token) {
        throw new FieldmarkApiError(
          "Not authenticated. Run `fieldmark auth login` or set FIELDMARK_TOKEN.",
          401
        );
      }
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let envelope: ApiEnvelope<T>;
    const text = await response.text();
    try {
      envelope = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      throw new FieldmarkApiError(
        `Invalid JSON response (${response.status}): ${text.slice(0, 200)}`,
        response.status
      );
    }

    if (!response.ok || (envelope.errors?.length ?? 0) > 0) {
      const errors = envelope.errors ?? [];
      if (!response.ok && errors.length === 0) {
        throw new FieldmarkApiError(`HTTP ${response.status}`, response.status);
      }
      if (errors.length > 0) {
        throw new FieldmarkApiError(
          errors.map((e) => `${e.field}: ${e.message}`).join("; "),
          response.status,
          errors
        );
      }
    }

    return envelope;
  }

  // --- Public endpoints ---

  health() {
    return this.request<{ status: string }>("GET", "/api/health", { auth: false });
  }

  register(user: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
  }) {
    return this.request<UserProfile>("POST", "/api/v1/auth/register", {
      auth: false,
      body: { user },
    });
  }

  login(email: string, password: string) {
    return this.request<UserProfile>("POST", "/api/v1/auth/login", {
      auth: false,
      body: { user: { email, password } },
    });
  }

  logout() {
    return this.request<{ message: string }>("DELETE", "/api/v1/auth/logout");
  }

  benchmarks(params: { region: string; commodity: string; year?: number }) {
    return this.request<Record<string, unknown>>("GET", "/api/v1/benchmarks", {
      query: params,
    });
  }

  listFarms(page?: number) {
    return this.request<unknown[]>("GET", "/api/v1/farms", { query: { page } });
  }

  getFarm(id: number) {
    return this.request<Record<string, unknown>>("GET", `/api/v1/farms/${id}`);
  }

  createFarm(farm: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("POST", "/api/v1/farms", { body: { farm } });
  }

  updateFarm(id: number, farm: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("PUT", `/api/v1/farms/${id}`, {
      body: { farm },
    });
  }

  deleteFarm(id: number) {
    return this.request<{ id: number }>("DELETE", `/api/v1/farms/${id}`);
  }

  listFields(farmId: number) {
    return this.request<unknown[]>("GET", `/api/v1/farms/${farmId}/fields`);
  }

  createField(farmId: number, field: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("POST", `/api/v1/farms/${farmId}/fields`, {
      body: { field },
    });
  }

  listInputCosts(fieldId: number) {
    return this.request<unknown[]>("GET", `/api/v1/fields/${fieldId}/input_costs`);
  }

  createInputCost(fieldId: number, inputCost: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/fields/${fieldId}/input_costs`,
      { body: { input_cost: inputCost } }
    );
  }

  listScenarios(farmId: number) {
    return this.request<unknown[]>("GET", `/api/v1/farms/${farmId}/scenarios`);
  }

  createScenario(farmId: number, scenario: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/farms/${farmId}/scenarios`,
      { body: { scenario } }
    );
  }

  calculateScenario(farmId: number, scenarioId: number) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/farms/${farmId}/scenarios/${scenarioId}/calculate`
    );
  }

  compareScenario(farmId: number, scenarioId: number) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/farms/${farmId}/scenarios/${scenarioId}/compare`
    );
  }

  createConversation(farmId: number, scenarioId?: number) {
    return this.request<Record<string, unknown>>("POST", "/api/v1/conversations", {
      body: {
        conversation: {
          farm_id: farmId,
          ...(scenarioId !== undefined ? { scenario_id: scenarioId } : {}),
        },
      },
    });
  }

  getConversation(id: number) {
    return this.request<Record<string, unknown>>("GET", `/api/v1/conversations/${id}`);
  }

  sendMessage(conversationId: number, content: string) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/conversations/${conversationId}/messages`,
      { body: { message: { content } } }
    );
  }

  /** Enqueues report generation; poll with getReport until status is completed. */
  generateReport(scenarioId: number, options: { regenerate?: boolean } = {}) {
    const query = options.regenerate ? { regenerate: "true" } : undefined;
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/scenarios/${scenarioId}/report`,
      { query }
    );
  }

  getReport(scenarioId: number) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/api/v1/scenarios/${scenarioId}/report`
    );
  }

  createDecision(scenarioId: number, decision: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/api/v1/scenarios/${scenarioId}/decision`,
      { body: { decision } }
    );
  }
}

export async function persistSession(
  client: FieldmarkClient,
  profile: UserProfile,
  email: string
): Promise<void> {
  const { saveConfig, loadConfig } = await import("./config.js");
  const config = await loadConfig();
  await saveConfig({
    ...config,
    baseUrl: client.getBaseUrl(),
    token: profile.token,
    email,
  });
  if (profile.token) {
    client.setToken(profile.token);
  }
}
