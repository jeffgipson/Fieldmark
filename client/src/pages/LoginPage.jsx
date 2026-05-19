import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import { DEMO_CREDENTIALS } from "../constants/app";
import { useAuth } from "../contexts/AuthContext";
import { friendlyError } from "../utils/errors";

export default function LoginPage() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
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

  return (
    <div className="fm-canvas flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md !shadow-[var(--shadow-fm-panel)]" hover={false}>
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="md" />
          <h1 className="font-display mt-4 text-2xl font-bold">Sign in</h1>
          <p className="mt-2 text-fm-charcoal">Know your margins before March.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs font-bold text-fm-teal hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <Button type="button" variant="ghost" className="mt-3 w-full" onClick={handleDemo} disabled={loading}>
          Use demo account
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
