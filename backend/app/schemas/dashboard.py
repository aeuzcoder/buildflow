from decimal import Decimal

from pydantic import BaseModel

from app.schemas.materials import MaterialBrief


class AdminDashboardStats(BaseModel):
    total_orders: int
    deliveries_today: int
    active_sites: int
    low_stock_materials: list[MaterialBrief]


class WarehouseDashboardStats(BaseModel):
    pending_approvals: int
    in_transit_deliveries: int
    stock_alerts: list[MaterialBrief]


class DriverDashboardStats(BaseModel):
    my_deliveries_today: int
    completed_this_week: int


class SiteManagerDashboardStats(BaseModel):
    my_pending_orders: int
    active_deliveries_to_my_sites: int


class DashboardStatsOut(BaseModel):
    role: str
    stats: (
        AdminDashboardStats
        | WarehouseDashboardStats
        | DriverDashboardStats
        | SiteManagerDashboardStats
    )
