from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.models import (
    ConstructionSite,
    Delivery,
    Material,
    Order,
    OrderItem,
    OrderStatus,
    User,
    UserRole,
)
from app.schemas.orders import OrderCreate

ORDER_LOAD_OPTIONS = [
    joinedload(Order.site),
    joinedload(Order.items).joinedload(OrderItem.material),
]


def _site_manager_owns_site(db: Session, user: User, site_id: int) -> bool:
    site = db.query(ConstructionSite).filter(ConstructionSite.id == site_id).first()
    return site is not None and site.site_manager_id == user.id


def _user_can_view_order(db: Session, user: User, order: Order) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER):
        return True
    if user.role == UserRole.SITE_MANAGER:
        return order.site.site_manager_id == user.id
    if user.role == UserRole.DRIVER:
        delivery = db.query(Delivery).filter(Delivery.order_id == order.id).first()
        return delivery is not None and delivery.driver_id == user.id
    return False


def list_orders(db: Session, user: User) -> list[Order]:
    query = db.query(Order).options(joinedload(Order.site))
    if user.role == UserRole.ADMIN or user.role == UserRole.WAREHOUSE_MANAGER:
        return query.order_by(Order.created_at.desc()).all()
    if user.role == UserRole.SITE_MANAGER:
        site_ids = [
            s.id
            for s in db.query(ConstructionSite)
            .filter(ConstructionSite.site_manager_id == user.id)
            .all()
        ]
        if not site_ids:
            return []
        return query.filter(Order.site_id.in_(site_ids)).order_by(Order.created_at.desc()).all()
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def get_order(db: Session, user: User, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(*ORDER_LOAD_OPTIONS)
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if not _user_can_view_order(db, user, order):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return order


def create_order(db: Session, user: User, data: OrderCreate) -> Order:
    if user.role != UserRole.SITE_MANAGER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Site managers only")
    if not _site_manager_owns_site(db, user, data.site_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your construction site")

    order = Order(
        site_id=data.site_id,
        created_by=user.id,
        status=OrderStatus.PENDING,
        delivery_date=data.delivery_date,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    for item in data.items:
        material = db.query(Material).filter(Material.id == item.material_id).first()
        if not material:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Material {item.material_id} not found",
            )
        db.add(
            OrderItem(
                order_id=order.id,
                material_id=material.id,
                quantity=item.quantity,
                unit_price=material.price_per_unit,
            )
        )

    db.commit()
    return get_order(db, user, order.id)


def approve_order(db: Session, user: User, order_id: int) -> Order:
    if user.role not in (UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    order = get_order(db, user, order_id)
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending orders can be approved")
    order.status = OrderStatus.APPROVED
    order.approved_by = user.id
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return get_order(db, user, order_id)


def reject_order(db: Session, user: User, order_id: int) -> Order:
    if user.role not in (UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    order = get_order(db, user, order_id)
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending orders can be rejected")
    order.status = OrderStatus.REJECTED
    order.approved_by = user.id
    order.updated_at = datetime.utcnow()
    db.commit()
    return get_order(db, user, order_id)


def cancel_order(db: Session, user: User, order_id: int) -> Order:
    if user.role != UserRole.SITE_MANAGER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Site managers only")
    order = get_order(db, user, order_id)
    if order.site.site_manager_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your order")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending orders can be cancelled")
    order.status = OrderStatus.CANCELLED
    order.updated_at = datetime.utcnow()
    db.commit()
    return get_order(db, user, order_id)
