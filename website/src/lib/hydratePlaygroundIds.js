import { getBaseUrl, getToken } from "./playgroundStorage";
import { runApiRequest } from "./runApiRequest";

/**
 * After demo login, fetch first farm / field / scenario IDs for path param hints.
 */
export async function fetchAccountIds() {
  const token = getToken();
  if (!token) return null;

  const baseUrl = getBaseUrl();
  const farmsRes = await runApiRequest({
    baseUrl,
    method: "GET",
    pathTemplate: "/api/v1/farms",
    pathParams: {},
    queryParams: { per_page: "1" },
    body: null,
    token,
    authRequired: true
  });

  const farm = farmsRes.data?.data?.[0];
  if (!farm?.id) return null;

  const result = { farm_id: String(farm.id), field_id: "", scenario_id: "" };

  const fieldsRes = await runApiRequest({
    baseUrl,
    method: "GET",
    pathTemplate: "/api/v1/farms/:farm_id/fields",
    pathParams: { farm_id: result.farm_id },
    queryParams: {},
    body: null,
    token,
    authRequired: true
  });
  const field = fieldsRes.data?.data?.[0];
  if (field?.id) result.field_id = String(field.id);

  const scenRes = await runApiRequest({
    baseUrl,
    method: "GET",
    pathTemplate: "/api/v1/farms/:farm_id/scenarios",
    pathParams: { farm_id: result.farm_id },
    queryParams: {},
    body: null,
    token,
    authRequired: true
  });
  const scenario = scenRes.data?.data?.[0];
  if (scenario?.id) result.scenario_id = String(scenario.id);

  return result;
}
