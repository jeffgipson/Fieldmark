import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import Card from "../components/ui/Card";
import Input, { FieldError } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { friendlyError } from "../utils/errors";
import { validateEmail, validateLoginForm, validateRequired } from "../utils/formValidation";

const FIELD_VALIDATORS = {
  email: (form) => validateEmail(form.email),
  password: (form) => validateRequired(form.password, "Password")
};

export default function LoginPage() {
  const { login, loginDemo, isAuthenticated, bootstrapping } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
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

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateLoginForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setError(null);
    try {
      await loginDemo();
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  if (bootstrapping) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="fm-canvas flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md !shadow-[var(--shadow-fm-panel)]" hover={false}>
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="md" />
          <h1 className="font-display mt-4 text-2xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-fm-gray-medium">Know your margins before March.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-3" autoComplete="on">
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => validateField("email")}
              error={fieldErrors.email}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="username"
            />
            <FieldError id="email-error">{fieldErrors.email}</FieldError>
          </div>
          <div>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={() => validateField("password")}
              error={fieldErrors.password}
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
            />
            <FieldError id="password-error">{fieldErrors.password}</FieldError>
            <p className="mt-1 text-right">
              <Link to="/forgot-password" className="text-xs font-bold text-fm-teal hover:underline">
                Forgot password?
              </Link>
            </p>
          </div>
          {error && <p className="rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">{error}</p>}
          <div className="pt-1">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={handleDemo}
          disabled={loading}
        >
          {loading ? "Opening demo…" : "Try demo — no password needed"}
        </Button>
        <p className="mt-6 text-center text-sm">
          New here?{" "}
          <Link to="/register" className="font-bold text-fm-teal hover:underline">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
