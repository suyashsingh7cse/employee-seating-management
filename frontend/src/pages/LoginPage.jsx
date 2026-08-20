import { Info, LayoutGrid, Loader2, Lock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 bg-cover bg-center"
    style={{
    backgroundImage: `
      linear-gradient(rgba(10, 14, 18, 0.58), rgba(10, 14, 18, 0.58)),
      url('/office-background.png')
    `
    }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-sidebar flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-brand" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Seating Admin</span>
        </div>

        <div className="bg-surface border border-line rounded-xl shadow-sm p-8">
          <h1 className="text-lg font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-ink-soft mb-6">Administrator access to the seating console.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-ink-soft mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm focus:border-brand transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-soft mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm focus:border-brand transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-seat-error bg-seat-error-soft rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-sidebar text-white text-sm font-medium py-2.5 rounded-lg hover:bg-black transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div className="mt-4 bg-canvas border border-line rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="w-3.5 h-3.5 text-ink-faint" strokeWidth={2} />
            <p className="text-xs font-semibold text-ink-soft">Demo Credentials</p>
          </div>
          <p className="text-[11px] text-ink-faint mb-2.5">
            For evaluation and demonstration purposes only
          </p>
          <div className="space-y-1 text-xs font-mono">
            <p className="text-ink">
              Username: <span className="text-ink-soft">admin</span>
            </p>
            <p className="text-ink">
              Password: <span className="text-ink-soft">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
