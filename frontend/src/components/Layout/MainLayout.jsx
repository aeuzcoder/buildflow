import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS, ROLES } from "../../utils/roles";

const PROFILE_NAV = { to: "/profile", label: "My Profile", icon: "👤" };

const NAV_BY_ROLE = {
  [ROLES.ADMIN]: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/orders", label: "Orders", icon: "📦" },
    { to: "/deliveries", label: "Deliveries", icon: "🚚" },
    { to: "/materials", label: "Materials", icon: "🧱" },
    { to: "/sites", label: "Sites", icon: "🏗️" },
    { to: "/users", label: "Users", icon: "👥" },
  ],
  [ROLES.WAREHOUSE_MANAGER]: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/orders", label: "Orders", icon: "📦" },
    { to: "/deliveries", label: "Deliveries", icon: "🚚" },
    { to: "/materials", label: "Materials", icon: "🧱" },
  ],
  [ROLES.DRIVER]: [
    { to: "/my-deliveries", label: "My Deliveries", icon: "🚚" },
  ],
  [ROLES.SITE_MANAGER]: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/my-orders", label: "My Orders", icon: "📋" },
    { to: "/sites", label: "Sites", icon: "🏗️" },
  ],
  [ROLES.SUPPLIER]: [
    { to: "/materials", label: "My Materials", icon: "🧱" },
  ],
};

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
  }`;

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [PROFILE_NAV, ...(NAV_BY_ROLE[user?.role] || [])];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            BF
          </div>
          <div>
            <p className="text-sm font-bold text-brand-800">BuildFlow</p>
            <p className="text-xs text-slate-500">Delivery Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
          © {new Date().getFullYear()} BuildFlow
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">
            Construction Delivery Management
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-right hover:opacity-80">
              <p className="text-sm font-medium text-slate-800">{user?.full_name}</p>
              <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
