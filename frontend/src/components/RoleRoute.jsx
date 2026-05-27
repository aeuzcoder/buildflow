import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Forbidden from "../pages/Forbidden";

export default function RoleRoute({ requiredRoles }) {
  const { user } = useAuth();

  if (requiredRoles?.length && !requiredRoles.includes(user?.role)) {
    return <Forbidden />;
  }

  return <Outlet />;
}
