const API_BASE = import.meta.env.VITE_API_URL || "";

function authHeaders(token) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(token),
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json.errors?.[0]?.message || "Request failed";
    throw new Error(message);
  }
  return json.data;
}

export const api = {
  createConversation(token, { farmId, scenarioId }) {
    return request("/api/v1/conversations", {
      method: "POST",
      token,
      body: { conversation: { farm_id: farmId, scenario_id: scenarioId } }
    });
  },

  getConversation(token, conversationId) {
    return request(`/api/v1/conversations/${conversationId}`, { token });
  },

  sendMessage(token, conversationId, content) {
    return request(`/api/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      token,
      body: { message: { content } }
    });
  },

  generateReport(token, scenarioId, regenerate = false) {
    const query = regenerate ? "?regenerate=true" : "";
    return request(`/api/v1/scenarios/${scenarioId}/report${query}`, {
      method: "POST",
      token
    });
  },

  getReport(token, scenarioId) {
    return request(`/api/v1/scenarios/${scenarioId}/report`, { token });
  }
};
