import http, { unwrap } from "./http";

export async function createConversation({ farmId, scenarioId }) {
  const res = await http.post("/api/v1/conversations", {
    conversation: { farm_id: farmId, scenario_id: scenarioId }
  });
  return unwrap(res);
}

export async function getConversation(id) {
  const res = await http.get(`/api/v1/conversations/${id}`);
  return unwrap(res);
}

export async function sendMessage(conversationId, content) {
  const res = await http.post(`/api/v1/conversations/${conversationId}/messages`, {
    message: { content }
  });
  return unwrap(res);
}
