import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { AuthProvider } from "./context/AuthContext";
import { ROLES } from "./utils/roles";
import Dashboard from "./pages/Dashboard";
import DeliveriesList from "./pages/Deliveries/DeliveriesList";
import Forbidden from "./pages/Forbidden";
import HomeRedirect from "./pages/HomeRedirect";
import PublicLayout from "./components/Layout/PublicLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MaterialsList from "./pages/Materials/MaterialsList";
import CreateOrder from "./pages/Orders/CreateOrder";
import OrdersList from "./pages/Orders/OrdersList";
import Profile from "./pages/Profile";
import UsersList from "./pages/Users/UsersList";
import SitesList from "./pages/Sites/SitesList";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<HomeRedirect />} />
              <Route path="profile" element={<Profile />} />

              <Route
                element={
                  <RoleRoute
                    requiredRoles={[
                      ROLES.ADMIN,
                      ROLES.WAREHOUSE_MANAGER,
                      ROLES.SITE_MANAGER,
                    ]}
                  />
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
              </Route>

              <Route
                element={
                  <RoleRoute
                    requiredRoles={[ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER]}
                  />
                }
              >
                <Route path="orders" element={<OrdersList />} />
                <Route path="deliveries" element={<DeliveriesList />} />
              </Route>

              <Route element={<RoleRoute requiredRoles={[ROLES.SITE_MANAGER]} />}>
                <Route
                  path="my-orders"
                  element={<OrdersList createPath="/my-orders/new" />}
                />
                <Route path="my-orders/new" element={<CreateOrder />} />
              </Route>

              <Route element={<RoleRoute requiredRoles={[ROLES.DRIVER]} />}>
                <Route path="my-deliveries" element={<DeliveriesList />} />
              </Route>

              <Route path="materials" element={<MaterialsList />} />

              <Route
                element={
                  <RoleRoute requiredRoles={[ROLES.ADMIN, ROLES.SITE_MANAGER]} />
                }
              >
                <Route path="sites" element={<SitesList />} />
              </Route>

              <Route element={<RoleRoute requiredRoles={[ROLES.ADMIN]} />}>
                <Route path="users" element={<UsersList />} />
              </Route>
            </Route>
          </Route>

          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
