export const ROLES = {
  ADMIN: "admin",
  WAREHOUSE_MANAGER: "warehouse_manager",
  DRIVER: "driver",
  SITE_MANAGER: "site_manager",
  SUPPLIER: "supplier",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.WAREHOUSE_MANAGER]: "Warehouse Manager",
  [ROLES.DRIVER]: "Driver",
  [ROLES.SITE_MANAGER]: "Site Manager",
  [ROLES.SUPPLIER]: "Supplier",
};

export const ROLE_HOME_PATHS = {
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.WAREHOUSE_MANAGER]: "/dashboard",
  [ROLES.DRIVER]: "/my-deliveries",
  [ROLES.SITE_MANAGER]: "/my-orders",
  [ROLES.SUPPLIER]: "/materials",
};

export function getHomePath(role) {
  return ROLE_HOME_PATHS[role] || "/dashboard";
}
