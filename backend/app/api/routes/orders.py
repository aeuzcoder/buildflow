from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.orders import OrderCreate, OrderListOut, OrderOut
from app.services import order_service

router = APIRouter(tags=["orders"])


@router.get("", response_model=list[OrderListOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.SITE_MANAGER)
    ),
):
    """GET /orders — admin & warehouse_manager: all; site_manager: own sites only."""
    return order_service.list_orders(db, current_user)


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SITE_MANAGER)),
):
    """POST /orders — site_manager only; creates order with line items."""
    return order_service.create_order(db, current_user, data)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """GET /orders/{id} — site_manager (own site), warehouse_manager, admin, assigned driver."""
    return order_service.get_order(db, current_user, order_id)


@router.patch("/{order_id}/approve", response_model=OrderOut)
def approve_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN)),
):
    """PATCH /orders/{id}/approve — warehouse_manager, admin; pending → approved."""
    return order_service.approve_order(db, current_user, order_id)


@router.patch("/{order_id}/reject", response_model=OrderOut)
def reject_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN)),
):
    """PATCH /orders/{id}/reject — warehouse_manager, admin; pending → rejected."""
    return order_service.reject_order(db, current_user, order_id)


@router.patch("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SITE_MANAGER)),
):
    """PATCH /orders/{id}/cancel — site_manager; own pending orders only."""
    return order_service.cancel_order(db, current_user, order_id)
