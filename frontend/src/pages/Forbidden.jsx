import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomePath } from "../utils/roles";

export default function Forbidden() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-brand-200">403</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800">Access Denied</h1>
      <p className="mt-2 max-w-md text-slate-500">
        You do not have permission to view this page.
      </p>
      <Link
        to={getHomePath(user?.role)}
        className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Go to Home
      </Link>
    </div>
  );
}
