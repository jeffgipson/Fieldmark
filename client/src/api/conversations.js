import http, { unwrap } from "./http";

export async function createConversation({ farmId, scenarioId, clientPath }) {
  const res = await http.post("/api/v1/conversations", {
    conversation: {
      farm_id: farmId,
      scenario_id: scenarioId,
      ...(clientPath ? { client_path: clientPath } : {})
    }
  });
  return unwrap(res);
}

export async function getConversation(id) {
  const res = await http.get(`/api/v1/conversations/${id}`);
  return unwrap(res);
}

export async function sendMessage(conversationId, content, { clientPath } = {}) {
  const res = await http.post(`/api/v1/conversations/${conversationId}/messages`, {
    message: {
      content,
      ...(clientPath ? { client_path: clientPath } : {})
    }
  });
  return unwrap(res);
}
