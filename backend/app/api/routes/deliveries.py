from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.db.database import get_db
from app.db.models import DeliveryStatus, User, UserRole
from app.schemas.deliveries import DeliveryOut, DeliveryStatusUpdate
from app.services import delivery_service

router = APIRouter(tags=["deliveries"])

DRIVER_STATUS_VALUES = {"loading", "in_transit", "delivered", "failed"}


@router.get("", response_model=list[DeliveryOut])
def list_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DRIVER)),
):
    """GET /deliveries — admin: all; driver: own deliveries only."""
    return delivery_service.list_deliveries(db, current_user)


@router.get("/{delivery_id}", response_model=DeliveryOut)
def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.DRIVER)
    ),
):
    """GET /deliveries/{id} — assigned driver, warehouse_manager, admin."""
    return delivery_service.get_delivery(db, current_user, delivery_id)


@router.patch("/{delivery_id}/status", response_model=DeliveryOut)
def update_delivery_status(
    delivery_id: int,
    data: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DRIVER)),
):
    """PATCH /deliveries/{id}/status — driver only; updates loading/in_transit/delivered/failed."""
    if data.status.value not in DRIVER_STATUS_VALUES:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"status must be one of: {', '.join(sorted(DRIVER_STATUS_VALUES))}",
        )
    return delivery_service.update_delivery_status(db, current_user, delivery_id, data)
