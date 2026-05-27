from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.sites import SiteCreate, SiteOut, SiteUpdate
from app.services import site_service

router = APIRouter(tags=["sites"])


@router.get("", response_model=list[SiteOut])
def list_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SITE_MANAGER)),
):
    """GET /sites — admin: all; site_manager: own sites only."""
    return site_service.list_sites(db, current_user)


@router.post("", response_model=SiteOut, status_code=status.HTTP_201_CREATED)
def create_site(
    data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SITE_MANAGER)),
):
    """POST /sites — admin (any manager) or site_manager (assigned to self)."""
    return site_service.create_site(db, current_user, data)


@router.patch("/{site_id}", response_model=SiteOut)
def update_site(
    site_id: int,
    data: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SITE_MANAGER)),
):
    """PATCH /sites/{id} — admin any site; site_manager own sites only."""
    return site_service.update_site(db, current_user, site_id, data)


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SITE_MANAGER)),
):
    """DELETE /sites/{id} — admin or owner site_manager; blocked if site has orders."""
    site_service.delete_site(db, current_user, site_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
