from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.models import ConstructionSite, Delivery, Order, Supplier, User, UserRole
from app.schemas.users import UserAdminCreate, UserAdminUpdate, UserProfileUpdate


def list_users(db: Session, user: User) -> list[User]:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return db.query(User).order_by(User.created_at.desc()).all()


def get_user(db: Session, current_user: User, user_id: int) -> User:
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return target


def get_own_profile(db: Session, user: User) -> User:
    return db.query(User).filter(User.id == user.id).first()


def update_own_profile(db: Session, user: User, data: UserProfileUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "contact_email" and value == "":
            value = None
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def create_user(db: Session, current_user: User, data: UserAdminCreate) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        is_active=data.is_active,
        phone=data.phone,
        contact_email=data.contact_email,
        address=data.address,
        city=data.city,
        company=data.company,
        notes=data.notes,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, current_user: User, user_id: int, data: UserAdminUpdate) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    target = get_user(db, current_user, user_id)
    update_data = data.model_dump(exclude_unset=True)

    if "password" in update_data:
        password = update_data.pop("password")
        if password:
            target.hashed_password = hash_password(password)

    if "email" in update_data and update_data["email"] != target.email:
        dup = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
        if dup:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    for field, value in update_data.items():
        if field == "contact_email" and value == "":
            value = None
        setattr(target, field, value)

    db.commit()
    db.refresh(target)
    return target


def deactivate_user(db: Session, current_user: User, user_id: int) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    target = get_user(db, current_user, user_id)
    if target.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate yourself")
    target.is_active = False
    db.commit()
    db.refresh(target)
    return target


def delete_user(db: Session, current_user: User, user_id: int) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    target = get_user(db, current_user, user_id)
    if target.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")

    has_sites = db.query(ConstructionSite).filter(ConstructionSite.site_manager_id == user_id).count()
    has_orders = db.query(Order).filter(
        (Order.created_by == user_id) | (Order.approved_by == user_id)
    ).count()
    has_deliveries = db.query(Delivery).filter(Delivery.driver_id == user_id).count()
    has_supplier = db.query(Supplier).filter(Supplier.user_id == user_id).first()

    if any([has_sites, has_orders, has_deliveries, has_supplier]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user with related records. Deactivate instead.",
        )

    try:
        db.delete(target)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user with related records. Deactivate instead.",
        )
