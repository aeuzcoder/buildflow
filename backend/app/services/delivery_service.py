from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.models import Delivery, DeliveryStatus, Order, OrderStatus, User, UserRole
from app.schemas.deliveries import DeliveryStatusUpdate

DELIVERY_LOAD_OPTIONS = [
    joinedload(Delivery.order).joinedload(Order.site),
]

DRIVER_ALLOWED_STATUSES = {
    DeliveryStatus.LOADING,
    DeliveryStatus.IN_TRANSIT,
    DeliveryStatus.DELIVERED,
    DeliveryStatus.FAILED,
}

ORDER_STATUS_MAP = {
    DeliveryStatus.IN_TRANSIT: OrderStatus.IN_TRANSIT,
    DeliveryStatus.DELIVERED: OrderStatus.DELIVERED,
}


def _user_can_view_delivery(db: Session, user: User, delivery: Delivery) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER):
        return True
    if user.role == UserRole.DRIVER:
        return delivery.driver_id == user.id
    return False


def list_deliveries(db: Session, user: User) -> list[Delivery]:
    query = db.query(Delivery).options(*DELIVERY_LOAD_OPTIONS)
    if user.role == UserRole.ADMIN:
        return query.order_by(Delivery.scheduled_at.desc()).all()
    if user.role == UserRole.DRIVER:
        return query.filter(Delivery.driver_id == user.id).order_by(Delivery.scheduled_at.desc()).all()
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def get_delivery(db: Session, user: User, delivery_id: int) -> Delivery:
    delivery = (
        db.query(Delivery)
        .options(*DELIVERY_LOAD_OPTIONS)
        .filter(Delivery.id == delivery_id)
        .first()
    )
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    if not _user_can_view_delivery(db, user, delivery):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return delivery


def update_delivery_status(
    db: Session, user: User, delivery_id: int, data: DeliveryStatusUpdate
) -> Delivery:
    if user.role != UserRole.DRIVER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Drivers only")
    if data.status not in DRIVER_ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be one of: loading, in_transit, delivered, failed",
        )

    delivery = get_delivery(db, user, delivery_id)
    if delivery.driver_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your delivery")

    now = datetime.utcnow()
    delivery.status = data.status
    if data.notes is not None:
        delivery.notes = data.notes

    if data.status == DeliveryStatus.LOADING and delivery.started_at is None:
        delivery.started_at = now
    if data.status == DeliveryStatus.IN_TRANSIT:
        delivery.started_at = delivery.started_at or now
    if data.status == DeliveryStatus.DELIVERED:
        delivery.delivered_at = now
    if data.status == DeliveryStatus.FAILED:
        delivery.delivered_at = None

    order = db.query(Order).filter(Order.id == delivery.order_id).first()
    if order and data.status in ORDER_STATUS_MAP:
        order.status = ORDER_STATUS_MAP[data.status]
        order.updated_at = now

    db.commit()
    return get_delivery(db, user, delivery_id)
