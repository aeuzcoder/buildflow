import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { tokenStorage } from "../services/api";
import { ROLES } from "../utils/roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(tokenStorage.get());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = tokenStorage.get();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return null;
    }
    const { data } = await api.get("/auth/me");
    setUser(data);
    setToken(storedToken);
    return data;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (tokenStorage.get()) {
          await refreshUser();
        }
      } catch {
        tokenStorage.remove();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    tokenStorage.set(data.access_token);
    setToken(data.access_token);
    const me = await refreshUser();
    return me;
  }, [refreshUser]);

  const register = useCallback(
    async ({ email, password, full_name, role }) => {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        full_name,
        role,
      });
      tokenStorage.set(data.access_token);
      setToken(data.access_token);
      const me = await refreshUser();
      return me;
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role) => user?.role === role,
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: Boolean(token && user),
      isAdmin: () => hasRole(ROLES.ADMIN),
      isWarehouseManager: () => hasRole(ROLES.WAREHOUSE_MANAGER),
      isDriver: () => hasRole(ROLES.DRIVER),
      isSiteManager: () => hasRole(ROLES.SITE_MANAGER),
      isAdminOrSiteManager: () =>
        hasRole(ROLES.ADMIN) || hasRole(ROLES.SITE_MANAGER),
      isSupplier: () => hasRole(ROLES.SUPPLIER),
    }),
    [user, token, isLoading, login, register, logout, refreshUser, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
