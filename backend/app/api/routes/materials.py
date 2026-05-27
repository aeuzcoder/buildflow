from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.materials import MaterialCreate, MaterialOut, MaterialUpdate
from app.services import material_service

router = APIRouter(tags=["materials"])


@router.get("", response_model=list[MaterialOut])
def list_materials(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """GET /materials — all authenticated users."""
    return material_service.list_materials(db)


@router.post("", response_model=MaterialOut, status_code=201)
def create_material(
    data: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.SUPPLIER)
    ),
):
    """POST /materials — warehouse_manager any supplier; supplier own materials only."""
    return material_service.create_material(db, current_user, data)


@router.patch("/{material_id}", response_model=MaterialOut)
def update_material(
    material_id: int,
    data: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN, UserRole.SUPPLIER)
    ),
):
    """PATCH /materials/{id} — warehouse_manager, admin; supplier own materials only."""
    return material_service.update_material(db, current_user, material_id, data)


@router.delete("/{material_id}", status_code=204)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """DELETE /materials/{id} — admin only."""
    material_service.delete_material(db, current_user, material_id)
    return Response(status_code=204)
