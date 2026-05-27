from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.dashboard import DashboardStatsOut
from app.services import dashboard_service

router = APIRouter(tags=["dashboard"])


@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.WAREHOUSE_MANAGER,
            UserRole.DRIVER,
            UserRole.SITE_MANAGER,
        )
    ),
):
    """GET /dashboard/stats — role-based KPIs for admin, warehouse_manager, driver, site_manager."""
    return dashboard_service.get_dashboard_stats(db, current_user)
