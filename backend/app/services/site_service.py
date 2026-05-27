from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.models import ConstructionSite, Order, User, UserRole
from app.schemas.sites import SiteCreate, SiteUpdate


def list_sites(db: Session, user: User) -> list[ConstructionSite]:
    query = db.query(ConstructionSite).options(joinedload(ConstructionSite.site_manager))
    if user.role == UserRole.ADMIN:
        return query.order_by(ConstructionSite.name).all()
    if user.role == UserRole.SITE_MANAGER:
        return query.filter(ConstructionSite.site_manager_id == user.id).order_by(ConstructionSite.name).all()
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def get_site(db: Session, site_id: int) -> ConstructionSite:
    site = (
        db.query(ConstructionSite)
        .options(joinedload(ConstructionSite.site_manager))
        .filter(ConstructionSite.id == site_id)
        .first()
    )
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


def _validate_manager(db: Session, manager_id: int) -> User:
    manager = db.query(User).filter(User.id == manager_id).first()
    if not manager or manager.role != UserRole.SITE_MANAGER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid site manager")
    if not manager.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Site manager is inactive")
    return manager


def _can_manage_site(user: User, site: ConstructionSite) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    if user.role == UserRole.SITE_MANAGER:
        return site.site_manager_id == user.id
    return False


def create_site(db: Session, user: User, data: SiteCreate) -> ConstructionSite:
    if user.role not in (UserRole.ADMIN, UserRole.SITE_MANAGER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if user.role == UserRole.SITE_MANAGER:
        manager_id = user.id
    else:
        if not data.site_manager_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="site_manager_id is required for admin",
            )
        manager_id = data.site_manager_id
        _validate_manager(db, manager_id)

    site = ConstructionSite(
        name=data.name,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        site_manager_id=manager_id,
        status=data.status,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return get_site(db, site.id)


def update_site(db: Session, user: User, site_id: int, data: SiteUpdate) -> ConstructionSite:
    site = get_site(db, site_id)
    if not _can_manage_site(user, site):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    update_data = data.model_dump(exclude_unset=True)

    if user.role == UserRole.SITE_MANAGER:
        update_data.pop("site_manager_id", None)

    if "site_manager_id" in update_data and update_data["site_manager_id"] is not None:
        _validate_manager(db, update_data["site_manager_id"])

    for field, value in update_data.items():
        setattr(site, field, value)

    db.commit()
    return get_site(db, site_id)


def delete_site(db: Session, user: User, site_id: int) -> None:
    site = get_site(db, site_id)
    if not _can_manage_site(user, site):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    order_count = db.query(Order).filter(Order.site_id == site_id).count()
    if order_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete site with {order_count} order(s). Remove or reassign orders first.",
        )

    db.delete(site)
    db.commit()
