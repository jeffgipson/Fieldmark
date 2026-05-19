import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../api/auth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { friendlyError } from "../utils/errors";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setError("This reset link is invalid. Request a new one from the sign-in page.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password, passwordConfirmation);
      navigate("/login", { replace: true, state: { passwordReset: true } });
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
          <h1 className="font-display mt-4 text-2xl font-bold">Choose a new password</h1>
        </div>

        {!token ? (
          <p className="rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">
            This reset link is missing or invalid.{" "}
            <Link to="/forgot-password" className="font-bold text-fm-teal hover:underline">
              Request a new link
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="password_confirmation">Confirm new password</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Update password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-bold text-fm-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
