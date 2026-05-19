import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import * as farmsApi from "../api/farms";
import * as fieldsApi from "../api/fields";
import * as scenariosApi from "../api/scenarios";
import { friendlyError } from "../utils/errors";
import { useAuth } from "./AuthContext";

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [farm, setFarm] = useState(null);
  const [fields, setFields] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daleHasFindings, setDaleHasFindings] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const farms = await farmsApi.listFarms();
      const list = Array.isArray(farms) ? farms : farms?.items || [];
      const primary = list[0] || null;
      setFarm(primary);
      if (!primary) {
        setFields([]);
        setScenarios([]);
        setDaleHasFindings(false);
        return;
      }
      const [fieldList, scenarioList, comparisonResult] = await Promise.all([
        fieldsApi.listFields(primary.id),
        scenariosApi.listScenarios(primary.id),
        scenariosApi.compareScenario(primary.id, primary.scenarios[0].id)
      ]);
      const normalizedFields = Array.isArray(fieldList) ? fieldList : fieldList?.items || [];
      const normalizedScenarios = (Array.isArray(scenarioList) ? scenarioList : scenarioList?.items || []).map(s => 
        s.id === comparisonResult?.scenario?.id ? { ...s, peer_comparison: comparisonResult.peer_comparison } : s
      );
      setFields(normalizedFields);
      setScenarios(normalizedScenarios);
      const active = normalizedScenarios[0];
      setDaleHasFindings(Boolean(active?.peer_comparison || active?.results));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else {
      setFarm(null);
      setFields([]);
      setScenarios([]);
    }
  }, [isAuthenticated, refresh]);

  const primaryScenario = scenarios[0] || null;

  const value = useMemo(
    () => ({
      farm,
      fields,
      scenarios,
      primaryScenario,
      loading,
      error,
      daleHasFindings,
      setDaleHasFindings,
      refresh,
      setFarm,
      setFields,
      setScenarios
    }),
    [
      farm,
      fields,
      scenarios,
      primaryScenario,
      loading,
      error,
      daleHasFindings,
      refresh
    ]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within FarmProvider");
  return ctx;
}
