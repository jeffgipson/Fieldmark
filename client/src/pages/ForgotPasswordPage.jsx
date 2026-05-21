import { useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../api/auth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { friendlyError } from "../utils/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fm-canvas flex min-h-screen min-h-[100dvh] items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] lg:py-12">
      <Card className="w-full max-w-md !shadow-[var(--shadow-fm-panel)]" hover={false}>
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="md" />
          <h1 className="font-display mt-4 text-2xl font-bold">Forgot password</h1>
          <p className="mt-2 text-fm-charcoal">
            Enter your email and we will send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <p className="rounded-lg bg-fm-teal-muted-bg px-3 py-3 text-sm text-fm-charcoal">
            If an account exists for that email, you will receive reset instructions shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error && <p className="rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-fm-alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
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
