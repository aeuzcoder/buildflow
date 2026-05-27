import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_USERS } from "../utils/demoUsers";
import { getHomePath } from "../utils/roles";

export default function Login() {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const me = await login(email, password);
      navigate(getHomePath(me.role), { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Invalid email or password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="hidden flex-1 flex-col justify-between bg-brand-800 p-10 text-white lg:flex">
        <p className="text-lg font-medium text-brand-100">Demo accounts</p>
        <p className="text-sm text-brand-200">
          Database auto-seeds on first startup. Click a row to fill the form.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              No account?{" "}
              <Link to="/register" className="font-medium text-brand-600 hover:underline">
                Register
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@buildflow.uz"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Demo users (click to fill)</h3>
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2">Role</th>
                    <th className="py-2 pr-2">Email</th>
                    <th className="py-2">Password</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_USERS.map((u) => (
                    <tr
                      key={u.email}
                      onClick={() => fillDemo(u.email, u.password)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-brand-50"
                    >
                      <td className="py-2 pr-2 font-medium text-slate-700">{u.role}</td>
                      <td className="py-2 pr-2 text-slate-600">{u.email}</td>
                      <td className="py-2 font-mono text-slate-500">{u.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
