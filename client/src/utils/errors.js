export function friendlyError(error) {
  if (!error) return "Something went wrong. Please try again.";

  if (error.code === "ERR_NETWORK" || !error.response) {
    return "Having trouble connecting. Check your connection and try again.";
  }

  const message = error.message || "";
  if (/anthropic|analyst|ai/i.test(message)) {
    return "Dale is having trouble right now. Give it a minute and try again.";
  }

  return message || "Something went wrong. Please try again.";
}
