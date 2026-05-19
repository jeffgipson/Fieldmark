import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as farmsApi from "../api/farms";
import DaleAvatar from "../components/dale/DaleAvatar";
import LocationMapPicker from "../components/map/LocationMapPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import { COMMODITIES, REGIONS } from "../constants/app";
import { useAuth } from "../contexts/AuthContext";
import { useFarm } from "../contexts/FarmContext";
import { applyLocationInsights } from "../utils/applyLocationInsights";
import { friendlyError } from "../utils/errors";

export default function RegisterPage() {
  const { register } = useAuth();
  const { refresh } = useFarm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationMeta, setLocationMeta] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: searchParams.get("email") || "",
    password: "",
    farm_name: "",
    total_acres: "",
    county: "",
    region: "central",
    primary_commodity: "corn",
    latitude: null,
    longitude: null,
    boundary: null
  });

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) setForm((prev) => ({ ...prev, email }));
  }, [searchParams]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleLocationChange = useCallback(({ latitude, longitude, boundary }) => {
    setForm((prev) => ({ ...prev, latitude, longitude, boundary }));
  }, []);

  const handleInsights = useCallback((insights) => {
    setLocationMeta(insights.location_meta);
    setForm((prev) => applyLocationInsights(prev, insights));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password,
        ...(inviteToken ? { invite_token: inviteToken } : {})
      });
      await farmsApi.createFarm({
        name: form.farm_name,
        total_acres: Number(form.total_acres),
        county: form.county,
        region: form.region,
        primary_commodity: form.primary_commodity,
        latitude: form.latitude,
        longitude: form.longitude,
        location_meta: locationMeta || {}
      });
      await refresh();
      navigate("/dashboard", { state: { setupPriorities: true } });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fm-cream px-4 py-12">
      <Card className="w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <DaleAvatar variant="waving" size="lg" />
          <h1 className="font-display mt-4 text-2xl font-bold">Create your account</h1>
          {inviteToken && (
            <p className="mt-2 text-sm text-fm-charcoal/80">
              You were invited to join Fieldmark. Use the same email address from your invitation.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>First name</Label>
            <Input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} required />
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label>Farm name</Label>
            <Input value={form.farm_name} onChange={(e) => setField("farm_name", e.target.value)} required />
          </div>

          <div className="sm:col-span-2">
            <Label>Farm location</Label>
            <LocationMapPicker
              mode="point"
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={handleLocationChange}
              onInsights={handleInsights}
            />
          </div>

          <div>
            <Label>Total acres</Label>
            <Input type="number" value={form.total_acres} onChange={(e) => setField("total_acres", e.target.value)} required />
          </div>
          <div>
            <Label>County</Label>
            <Input value={form.county} onChange={(e) => setField("county", e.target.value)} required />
          </div>
          <div>
            <Label>Region</Label>
            <select
              className="w-full rounded-lg border-[1.5px] border-fm-input-border px-4 py-3"
              value={form.region}
              onChange={(e) => setField("region", e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Primary commodity</Label>
            <select
              className="w-full rounded-lg border-[1.5px] border-fm-input-border px-4 py-3"
              value={form.primary_commodity}
              onChange={(e) => setField("primary_commodity", e.target.value)}
            >
              {COMMODITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="sm:col-span-2 rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Get started"}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-fm-teal hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
