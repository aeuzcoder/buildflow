import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomePath } from "../utils/roles";

export default function HomeRedirect() {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePath(user.role)} replace />;
}
