import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import * as billingApi from "../api/billing";
import * as farmsApi from "../api/farms";
import * as fieldsApi from "../api/fields";
import * as prioritiesApi from "../api/priorities";
import * as scenariosApi from "../api/scenarios";
import { friendlyError } from "../utils/errors";
import { useAuth } from "./AuthContext";

const FarmContext = createContext(null);
const ACTIVE_FARM_KEY = "fieldmark_active_farm_id";

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.items || [];
}

export function FarmProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [farms, setFarms] = useState([]);
  const [farm, setFarm] = useState(null);
  const [activeFarmId, setActiveFarmIdState] = useState(() => {
    const stored = sessionStorage.getItem(ACTIVE_FARM_KEY);
    return stored ? Number(stored) : null;
  });
  const [fields, setFields] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daleHasFindings, setDaleHasFindings] = useState(false);
  const [priorities, setPriorities] = useState([]);
  const [prioritiesOnboardingSkipped, setPrioritiesOnboardingSkipped] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const setActiveFarmId = useCallback((id) => {
    setActiveFarmIdState(id);
    if (id != null) {
      sessionStorage.setItem(ACTIVE_FARM_KEY, String(id));
    } else {
      sessionStorage.removeItem(ACTIVE_FARM_KEY);
    }
  }, []);

  const loadFarmDetails = useCallback(async (primary) => {
    if (!primary) {
      setFields([]);
      setScenarios([]);
      setPriorities([]);
      setDaleHasFindings(false);
      return;
    }

    const [fieldList, scenarioList, priorityList] = await Promise.all([
      fieldsApi.listFields(primary.id),
      scenariosApi.listScenarios(primary.id),
      prioritiesApi.listPriorities(primary.id).catch(() => [])
    ]);

    const normalizedFields = normalizeList(fieldList);
    let normalizedScenarios = normalizeList(scenarioList);

    const activeScenario = normalizedScenarios[0];
    if (activeScenario?.id && activeScenario?.results) {
      try {
        const comparisonResult = await scenariosApi.compareScenario(
          primary.id,
          activeScenario.id
        );
        normalizedScenarios = normalizedScenarios.map((s) =>
          s.id === comparisonResult?.id
            ? { ...s, peer_comparison: comparisonResult.peer_comparison }
            : s
        );
      } catch (err) {
        console.warn("Peer comparison unavailable:", err);
      }
    }
    setFields(normalizedFields);
    setScenarios(normalizedScenarios);
    setPriorities(normalizeList(priorityList));
    const active = normalizedScenarios[0];
    setDaleHasFindings(Boolean(active?.peer_comparison || active?.results));
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [farmsPayload, billing] = await Promise.all([
        farmsApi.listFarms(),
        billingApi.getBilling().catch(() => null)
      ]);
      const list = normalizeList(farmsPayload);
      setFarms(list);
      setSubscription(billing);

      const storedId = sessionStorage.getItem(ACTIVE_FARM_KEY);
      const preferredId = storedId ? Number(storedId) : null;
      let primary = list.find((f) => f.id === preferredId) || list[0] || null;

      if (primary) {
        setActiveFarmId(primary.id);
      } else {
        setActiveFarmId(null);
      }

      setFarm(primary);
      await loadFarmDetails(primary);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadFarmDetails, setActiveFarmId]);

  const selectFarm = useCallback(
    async (farmId) => {
      const next = farms.find((f) => f.id === farmId);
      if (!next) return;
      setActiveFarmId(next.id);
      setFarm(next);
      setLoading(true);
      setError(null);
      try {
        await loadFarmDetails(next);
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [farms, loadFarmDetails, setActiveFarmId]
  );

  useEffect(() => {
    if (isAuthenticated) refresh();
    else {
      setFarms([]);
      setFarm(null);
      setFields([]);
      setScenarios([]);
      setPriorities([]);
      setSubscription(null);
      setActiveFarmId(null);
    }
  }, [isAuthenticated, refresh, setActiveFarmId]);

  const limits = subscription?.limits || {};
  const usage = subscription?.usage || {};
  const plan = subscription?.plan || "basic";

  const canCreateFarm = useMemo(() => {
    const max = limits.max_farms;
    if (max == null) return true;
    return farms.length < max;
  }, [farms.length, limits.max_farms]);

  const canAddField = useMemo(() => {
    const max = limits.max_fields_per_farm;
    if (max == null) return true;
    return fields.length < max;
  }, [fields.length, limits.max_fields_per_farm]);

  const activePriorities = useMemo(
    () => priorities.filter((p) => p.status === "active"),
    [priorities]
  );

  const needsPrioritiesCapture = Boolean(farm) && activePriorities.length === 0 && !prioritiesOnboardingSkipped;

  const syncPriorities = useCallback(
    async (items) => {
      if (!farm?.id) return [];
      const synced = await prioritiesApi.syncPriorities(farm.id, items);
      setPriorities(synced);
      return synced;
    },
    [farm?.id]
  );

  const skipPrioritiesOnboarding = useCallback(() => {
    setPrioritiesOnboardingSkipped(true);
  }, []);

  const primaryScenario = scenarios[0] || null;

  const mergeScenarioPeerComparison = useCallback((comparisonResult) => {
    if (!comparisonResult?.id) return;
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === comparisonResult.id
          ? { ...s, peer_comparison: comparisonResult.peer_comparison }
          : s
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      farms,
      farm,
      fields,
      scenarios,
      primaryScenario,
      loading,
      error,
      daleHasFindings,
      setDaleHasFindings,
      priorities,
      activePriorities,
      needsPrioritiesCapture,
      setPriorities,
      syncPriorities,
      skipPrioritiesOnboarding,
      refresh,
      setFarm,
      setFields,
      setScenarios,
      mergeScenarioPeerComparison,
      selectFarm,
      subscription,
      setSubscription,
      plan,
      limits,
      usage,
      canCreateFarm,
      canAddField
    }),
    [
      farms,
      farm,
      fields,
      scenarios,
      primaryScenario,
      loading,
      error,
      daleHasFindings,
      priorities,
      activePriorities,
      needsPrioritiesCapture,
      syncPriorities,
      skipPrioritiesOnboarding,
      refresh,
      selectFarm,
      mergeScenarioPeerComparison,
      subscription,
      plan,
      limits,
      usage,
      canCreateFarm,
      canAddField
    ]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within FarmProvider");
  return ctx;
}
