from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Material, Supplier, User, UserRole
from app.schemas.materials import MaterialCreate, MaterialUpdate

LOW_STOCK_THRESHOLD = 1000


def list_materials(db: Session) -> list[Material]:
    return db.query(Material).order_by(Material.name).all()


def get_material(db: Session, material_id: int) -> Material:
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return material


def _get_supplier_for_user(db: Session, user: User) -> Supplier:
    supplier = db.query(Supplier).filter(Supplier.user_id == user.id).first()
    if not supplier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supplier profile not found")
    return supplier


def _can_modify_material(user: User, material: Material, db: Session) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER):
        return True
    if user.role == UserRole.SUPPLIER:
        supplier = _get_supplier_for_user(db, user)
        return material.supplier_id == supplier.id
    return False


def create_material(db: Session, user: User, data: MaterialCreate) -> Material:
    if user.role not in (UserRole.WAREHOUSE_MANAGER, UserRole.SUPPLIER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    supplier_id = data.supplier_id
    if user.role == UserRole.SUPPLIER:
        supplier = _get_supplier_for_user(db, user)
        supplier_id = supplier.id
    elif supplier_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="supplier_id is required")
    else:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    material = Material(
        name=data.name,
        unit=data.unit,
        category=data.category,
        supplier_id=supplier_id,
        price_per_unit=data.price_per_unit,
        stock_quantity=data.stock_quantity,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


def update_material(db: Session, user: User, material_id: int, data: MaterialUpdate) -> Material:
    if user.role not in (UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.SUPPLIER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    material = get_material(db, material_id)
    if not _can_modify_material(user, material, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify this material")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)

    db.commit()
    db.refresh(material)
    return material


def delete_material(db: Session, user: User, material_id: int) -> None:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    material = get_material(db, material_id)
    db.delete(material)
    db.commit()


def get_low_stock_materials(db: Session) -> list[Material]:
    return (
        db.query(Material)
        .filter(Material.stock_quantity < LOW_STOCK_THRESHOLD)
        .order_by(Material.stock_quantity)
        .all()
    )
