export function friendlyError(error) {
  if (!error) return "Something went wrong. Please try again.";

  if (error.code === "ERR_NETWORK" || !error.response) {
    return "Having trouble connecting. Is the API running on port 3000?";
  }

  const status = error.response?.status;
  const apiMessage = error.response?.data?.errors?.[0]?.message;
  const apiField = error.response?.data?.errors?.[0]?.field;

  if (status === 404) {
    return "We couldn't find that resource.";
  }

  if (status === 401 || status === 422 || status === 402) {
    if (apiMessage) return apiMessage;
  }

  // AI / upstream failures (502/503) — show API message, not generic 500 text
  if (status === 502 || status === 503) {
    if (apiMessage) return apiMessage;
    if (apiField === "anthropic") {
      return "The AI service is unavailable. Check ANTHROPIC_API_KEY in api/.env.";
    }
  }

  if (apiMessage && (apiField === "anthropic" || /\banthropic\b|\banalyst\b/i.test(apiMessage))) {
    return apiMessage;
  }

  if (status >= 500) {
    return apiMessage || "The server had a problem. Check the API logs and try again.";
  }

  const field = error.field || apiField;
  const message = error.message || apiMessage || "";
  if (field === "anthropic" || /\banthropic\b|\banalyst\b/i.test(message)) {
    return apiMessage || "Dale is having trouble right now. Give it a minute and try again.";
  }

  return message || "Something went wrong. Please try again.";
}
