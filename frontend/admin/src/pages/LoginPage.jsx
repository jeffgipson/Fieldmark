import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@fieldmark.app");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, loginDemo, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(fn) {
    setError(null);
    setSubmitting(true);
    try {
      await fn();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-display text-center mb-4">Fieldmark Admin</h1>
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin(() => login(email, password));
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Login"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={submitting}
              onClick={() => handleLogin(loginDemo)}
            >
              Use Demo Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
