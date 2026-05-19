/**
 * Turn axios / API envelope failures into messages suitable for the UI.
 */
export function formatApiError(err) {
  if (!err?.response) {
    return "Cannot reach the API. In another terminal run: cd api && bin/dev";
  }

  const { status, data } = err.response;
  const apiMessage = data?.errors?.[0]?.message;

  if (apiMessage) return apiMessage;
  if (status === 401) return "Invalid email or password.";
  if (status === 403) return "You do not have permission to use the admin app.";
  if (status >= 500) {
    return "API server error. Ensure Rails is running (cd api && bin/dev) and try again.";
  }

  return err.message || "Request failed.";
}

export function toApiError(err) {
  const message = formatApiError(err);
  const next = new Error(message);
  if (err?.response?.data?.errors?.[0]?.field) {
    next.field = err.response.data.errors[0].field;
  }
  return next;
}
