import { Link, useLocation } from "react-router-dom";

export default function AppHeader() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            BF
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-brand-800">BuildFlow</p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Construction Delivery Management
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {!isLogin && (
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Login
            </Link>
          )}
          {!isRegister && (
            <Link
              to="/register"
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
