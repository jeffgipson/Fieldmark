import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as farmsApi from "../api/farms";
import DaleAvatar from "../components/dale/DaleAvatar";
import LocationMapPicker from "../components/map/LocationMapPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { FieldError, FormSection, Select } from "../components/ui/Input";
import { COMMODITIES, REGIONS } from "../constants/app";
import { useAuth } from "../contexts/AuthContext";
import { useFarm } from "../contexts/FarmContext";
import { applyLocationInsights } from "../utils/applyLocationInsights";
import { friendlyError } from "../utils/errors";
import {
  validateEmail,
  validateFarmLocation,
  validateName,
  validatePassword,
  validatePositiveNumber,
  validateRegisterForm,
  validateRequired
} from "../utils/formValidation";

const FIELD_VALIDATORS = {
  first_name: (form) => validateName(form.first_name, "First name"),
  last_name: (form) => validateName(form.last_name, "Last name"),
  email: (form) => validateEmail(form.email),
  password: (form) => validatePassword(form.password),
  farm_name: (form) => validateRequired(form.farm_name, "Farm name"),
  total_acres: (form) => validatePositiveNumber(form.total_acres, "Total acres"),
  county: (form) => validateRequired(form.county, "County"),
  location: (form) => validateFarmLocation(form)
};

export default function RegisterPage() {
  const { register } = useAuth();
  const { refresh } = useFarm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
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

  const clearFieldError = useCallback((key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  }

  function validateField(key) {
    const validator = FIELD_VALIDATORS[key];
    if (!validator) return;
    const message = validator(form);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  const handleLocationChange = useCallback(({ latitude, longitude, boundary, acres }) => {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
      boundary,
      ...(acres != null ? { total_acres: String(Math.round(acres * 10) / 10) } : {})
    }));
    clearFieldError("location");
    if (acres != null) clearFieldError("total_acres");
  }, [clearFieldError]);

  const handleInsights = useCallback((insights) => {
    setLocationMeta(insights.location_meta);
    setForm((prev) => {
      const updated = applyLocationInsights(prev, insights);
      if (insights.acres != null) {
        updated.total_acres = String(Math.round(insights.acres * 10) / 10);
      }
      return updated;
    });
    clearFieldError("county");
    clearFieldError("total_acres");
  }, [clearFieldError]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateRegisterForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password,
        ...(inviteToken ? { invite_token: inviteToken } : {})
      });
      await farmsApi.createFarm({
        name: form.farm_name.trim(),
        total_acres: Number(form.total_acres),
        county: form.county.trim(),
        region: form.region,
        primary_commodity: form.primary_commodity,
        latitude: form.latitude,
        longitude: form.longitude,
        boundary: form.boundary,
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
    <div className="fm-canvas flex min-h-screen min-h-[100dvh] items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] lg:py-12">
      <Card className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <DaleAvatar variant="waving" size="lg" />
          <h1 className="font-display mt-4 text-2xl font-bold">Create your account</h1>
          {inviteToken ? (
            <p className="mt-2 text-sm text-fm-charcoal/80">
              You were invited to join Fieldmark. Use the same email address from your invitation.
            </p>
          ) : (
            <p className="mt-2 text-sm text-fm-gray-medium">
              A few details to get your farm set up.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2">
          <div>
            <Input
              id="first_name"
              value={form.first_name}
              onChange={(e) => setField("first_name", e.target.value)}
              onBlur={() => validateField("first_name")}
              error={fieldErrors.first_name}
              placeholder="First name"
              aria-label="First name"
              autoComplete="given-name"
            />
            <FieldError id="first_name-error">{fieldErrors.first_name}</FieldError>
          </div>
          <div>
            <Input
              id="last_name"
              value={form.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
              onBlur={() => validateField("last_name")}
              error={fieldErrors.last_name}
              placeholder="Last name"
              aria-label="Last name"
              autoComplete="family-name"
            />
            <FieldError id="last_name-error">{fieldErrors.last_name}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => validateField("email")}
              error={fieldErrors.email}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
            />
            <FieldError id="email-error">{fieldErrors.email}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={() => validateField("password")}
              error={fieldErrors.password}
              placeholder="Password (6+ characters)"
              aria-label="Password"
              autoComplete="new-password"
              minLength={6}
            />
            <FieldError id="password-error">{fieldErrors.password}</FieldError>
          </div>

          <FormSection title="Your farm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="farm_name"
                  value={form.farm_name}
                  onChange={(e) => setField("farm_name", e.target.value)}
                  onBlur={() => validateField("farm_name")}
                  error={fieldErrors.farm_name}
                  placeholder="Farm name"
                  aria-label="Farm name"
                  autoComplete="organization"
                />
                <FieldError id="farm_name-error">{fieldErrors.farm_name}</FieldError>
              </div>

              <div className="sm:col-span-2">
                <LocationMapPicker
                  mode="polygon"
                  latitude={form.latitude}
                  longitude={form.longitude}
                  boundary={form.boundary}
                  onLocationChange={handleLocationChange}
                  onInsights={handleInsights}
                />
                <FieldError id="location-error">{fieldErrors.location}</FieldError>
              </div>

              <div>
                <Input
                  id="total_acres"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.total_acres}
                  onChange={(e) => setField("total_acres", e.target.value)}
                  onBlur={() => validateField("total_acres")}
                  error={fieldErrors.total_acres}
                  placeholder="Total acres"
                  aria-label="Total acres"
                />
                <FieldError id="total_acres-error">{fieldErrors.total_acres}</FieldError>
              </div>
              <div>
                <Input
                  id="county"
                  value={form.county}
                  onChange={(e) => setField("county", e.target.value)}
                  onBlur={() => validateField("county")}
                  error={fieldErrors.county}
                  placeholder="County"
                  aria-label="County"
                  autoComplete="address-level2"
                />
                <FieldError id="county-error">{fieldErrors.county}</FieldError>
              </div>
              <div>
                <Select
                  id="region"
                  value={form.region}
                  onChange={(e) => setField("region", e.target.value)}
                  aria-label="Region"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  id="primary_commodity"
                  value={form.primary_commodity}
                  onChange={(e) => setField("primary_commodity", e.target.value)}
                  aria-label="Primary commodity"
                >
                  {COMMODITIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </FormSection>

          {error && <p className="sm:col-span-2 rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">{error}</p>}
          <div className="sm:col-span-2 pt-1">
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
