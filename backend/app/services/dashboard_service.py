from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import (
    ConstructionSite,
    Delivery,
    DeliveryStatus,
    Order,
    OrderStatus,
    SiteStatus,
    User,
    UserRole,
)
from app.schemas.dashboard import (
    AdminDashboardStats,
    DashboardStatsOut,
    DriverDashboardStats,
    SiteManagerDashboardStats,
    WarehouseDashboardStats,
)
from app.schemas.materials import MaterialBrief
from app.services.material_service import get_low_stock_materials


def get_dashboard_stats(db: Session, user: User) -> DashboardStatsOut:
    if user.role == UserRole.ADMIN:
        return DashboardStatsOut(role=user.role.value, stats=_admin_stats(db))
    if user.role == UserRole.WAREHOUSE_MANAGER:
        return DashboardStatsOut(role=user.role.value, stats=_warehouse_stats(db))
    if user.role == UserRole.DRIVER:
        return DashboardStatsOut(role=user.role.value, stats=_driver_stats(db, user))
    if user.role == UserRole.SITE_MANAGER:
        return DashboardStatsOut(role=user.role.value, stats=_site_manager_stats(db, user))
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No dashboard for this role")


def _admin_stats(db: Session) -> AdminDashboardStats:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today_start + timedelta(days=1)
    low_stock = get_low_stock_materials(db)
    return AdminDashboardStats(
        total_orders=db.query(func.count(Order.id)).scalar() or 0,
        deliveries_today=(
            db.query(func.count(Delivery.id))
            .filter(Delivery.scheduled_at >= today_start, Delivery.scheduled_at < tomorrow)
            .scalar()
            or 0
        ),
        active_sites=(
            db.query(func.count(ConstructionSite.id))
            .filter(ConstructionSite.status == SiteStatus.ACTIVE)
            .scalar()
            or 0
        ),
        low_stock_materials=[MaterialBrief.model_validate(m) for m in low_stock],
    )


def _warehouse_stats(db: Session) -> WarehouseDashboardStats:
    low_stock = get_low_stock_materials(db)
    return WarehouseDashboardStats(
        pending_approvals=(
            db.query(func.count(Order.id))
            .filter(Order.status == OrderStatus.PENDING)
            .scalar()
            or 0
        ),
        in_transit_deliveries=(
            db.query(func.count(Delivery.id))
            .filter(Delivery.status == DeliveryStatus.IN_TRANSIT)
            .scalar()
            or 0
        ),
        stock_alerts=[MaterialBrief.model_validate(m) for m in low_stock],
    )


def _driver_stats(db: Session, user: User) -> DriverDashboardStats:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today_start + timedelta(days=1)
    week_start = today_start - timedelta(days=today_start.weekday())
    return DriverDashboardStats(
        my_deliveries_today=(
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.driver_id == user.id,
                Delivery.scheduled_at >= today_start,
                Delivery.scheduled_at < tomorrow,
            )
            .scalar()
            or 0
        ),
        completed_this_week=(
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.driver_id == user.id,
                Delivery.status == DeliveryStatus.DELIVERED,
                Delivery.delivered_at >= week_start,
            )
            .scalar()
            or 0
        ),
    )


def _site_manager_stats(db: Session, user: User) -> SiteManagerDashboardStats:
    site_ids = [
        s.id
        for s in db.query(ConstructionSite)
        .filter(ConstructionSite.site_manager_id == user.id)
        .all()
    ]
    if not site_ids:
        return SiteManagerDashboardStats(my_pending_orders=0, active_deliveries_to_my_sites=0)

    pending = (
        db.query(func.count(Order.id))
        .filter(Order.site_id.in_(site_ids), Order.status == OrderStatus.PENDING)
        .scalar()
        or 0
    )
    active_deliveries = (
        db.query(func.count(Delivery.id))
        .join(Order, Delivery.order_id == Order.id)
        .filter(
            Order.site_id.in_(site_ids),
            Delivery.status.in_(
                [DeliveryStatus.ASSIGNED, DeliveryStatus.LOADING, DeliveryStatus.IN_TRANSIT]
            ),
        )
        .scalar()
        or 0
    )
    return SiteManagerDashboardStats(
        my_pending_orders=pending,
        active_deliveries_to_my_sites=active_deliveries,
    )
